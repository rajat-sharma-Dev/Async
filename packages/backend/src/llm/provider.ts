import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../.env') });
config();

const DEFAULT_BASE_URL = process.env.LLM_BASE_URL || 'https://router-api.0g.ai/v1';
const DEFAULT_MODEL = process.env.LLM_MODEL || 'zai-org/GLM-5-FP8';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
  toolChoice?: 'auto' | 'none' | 'required';
  responseFormat?: { type: 'json_object' | 'text' } | { type: string };
}

export interface ChatResponse {
  content: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  toolCalls?: Array<{ id: string; function: { name: string; arguments: string } }>;
}

export interface LLMProvider {
  complete(prompt: string, options?: LLMOptions): Promise<string>;
  chat(messages: ChatMessage[], options?: LLMOptions): Promise<string>;
}

export class ZeroGComputeProvider implements LLMProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    this.baseUrl = baseUrl || DEFAULT_BASE_URL;
    this.apiKey = apiKey || process.env.LLM_API_KEY || '';
    this.model = model || DEFAULT_MODEL;
    if (!this.apiKey && process.env.AGENTVERSE_DEMO_MODE !== 'true') {
      console.warn('[0G Compute] No API key. Live LLM calls will fail.');
    }
  }

  async complete(prompt: string, options: LLMOptions = {}): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ChatMessage[], options: LLMOptions = {}): Promise<string> {
    const response = await this.chatRaw(messages, options);
    return response.content;
  }

  async chatRaw(messages: ChatMessage[], options: LLMOptions = {}): Promise<ChatResponse> {
    if (!this.apiKey || this.apiKey.includes('your_')) {
      throw new LLMError('0G Compute API key is not configured', 401);
    }

    const body: Record<string, unknown> = {
      model: options.model || this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      verify_tee: true,
    };
    if (options.tools?.length) {
      body.tools = options.tools;
      body.tool_choice = options.toolChoice || 'auto';
    }
    if (options.responseFormat) body.response_format = options.responseFormat;

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new LLMError(`0G Compute ${res.status}: ${err.error?.message || res.statusText}`, res.status);
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message || {};
    if (data.x_0g_trace) console.log('[0G Compute]', JSON.stringify(data.x_0g_trace));

    return {
      content: message.content || '',
      model: data.model || options.model || this.model,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      toolCalls: message.tool_calls?.map((tc: any) => ({ id: tc.id, function: tc.function })),
    };
  }

  async decomposeTask(
    taskDescription: string,
    availableRoles: string[],
  ): Promise<{ subtasks: Array<{ description: string; assignTo: string; priority: number }> }> {
    const response = await this.chatRaw(
      [
        {
          role: 'system',
          content: `You are a task decomposition engine. Break complex tasks into subtasks and assign each to the best available role. Roles: ${availableRoles.join(', ')}. Respond with JSON only.`,
        },
        {
          role: 'user',
          content: `Decompose: "${taskDescription}"\n\nJSON: { "subtasks": [{ "description": "...", "assignTo": "Role", "priority": 1-5 }] }`,
        },
      ],
      { responseFormat: { type: 'json_object' }, temperature: 0.3 },
    );
    try {
      return JSON.parse(response.content);
    } catch {
      return { subtasks: [{ description: taskDescription, assignTo: availableRoles[0], priority: 3 }] };
    }
  }

  async evaluateBid(params: {
    taskDescription: string;
    bidAmount: string;
    agentBudget: string;
    costSensitivity: number;
  }): Promise<{ accept: boolean; reason: string; counterOffer?: string }> {
    const response = await this.chatRaw(
      [
        {
          role: 'system',
          content: `Economic decision engine. Cost sensitivity: ${params.costSensitivity}/100. Respond JSON only.`,
        },
        {
          role: 'user',
          content: `Task: "${params.taskDescription}"\nBid: ${params.bidAmount}\nBudget: ${params.agentBudget}\nAccept? JSON: { "accept": bool, "reason": "...", "counterOffer": "amount or null" }`,
        },
      ],
      { responseFormat: { type: 'json_object' }, temperature: 0.2 },
    );
    try {
      return JSON.parse(response.content);
    } catch {
      return { accept: true, reason: 'Default acceptance' };
    }
  }

  async listModels(): Promise<Array<{ id: string; name: string; context_length: number }>> {
    if (!this.apiKey || this.apiKey.includes('your_')) {
      throw new LLMError('0G Compute API key is not configured', 401);
    }
    const res = await fetch(`${this.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new LLMError(`Models list failed: ${res.status}`, res.status);
    const data = await res.json();
    return data.data.map((m: any) => ({ id: m.id, name: m.name, context_length: m.context_length }));
  }
}

export class OpenAIProvider implements LLMProvider {
  private readonly apiKey = process.env.OPENAI_API_KEY || '';
  private readonly model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  async complete(prompt: string, options?: LLMOptions): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ChatMessage[], options: LLMOptions = {}): Promise<string> {
    if (!this.apiKey) throw new LLMError('OpenAI API key is not configured', 401);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages,
        max_tokens: options.maxTokens || 1200,
        temperature: options.temperature ?? 0.45,
      }),
    });
    if (!res.ok) throw new LLMError(`OpenAI ${res.status}: ${await res.text()}`, res.status);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }
}

export class LocalHeuristicProvider implements LLMProvider {
  async complete(prompt: string): Promise<string> {
    const trimmed = prompt.replace(/\s+/g, ' ').slice(0, 260);
    return `Local demo reasoning: ${trimmed}${prompt.length > 260 ? '...' : ''}`;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    return this.complete(messages.map((message) => message.content).join('\n'));
  }
}

export class LLMError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'LLMError';
  }
}

let zeroGProvider: ZeroGComputeProvider | undefined;
export function getLLM(): ZeroGComputeProvider {
  if (!zeroGProvider) zeroGProvider = new ZeroGComputeProvider();
  return zeroGProvider;
}

export function createLLMProvider(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER || '0g').toLowerCase();
  if (provider === 'local' || process.env.AGENTVERSE_DEMO_MODE === 'true') return new LocalHeuristicProvider();
  if (provider === 'openai') return new OpenAIProvider();
  return getLLM();
}
