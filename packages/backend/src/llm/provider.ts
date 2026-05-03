/**
 * 0G Compute LLM Provider
 * OpenAI-compatible decentralized inference
 * 📖 Ref: docs/tracks-docs/OG-compute.md
 *
 * API: https://router-api.0g.ai/v1
 * All models are TEE-attested (TDX enclaves)
 *
 * Available models:
 *   deepseek/deepseek-chat-v3-0324  - 671B MoE, best quality, tool calling
 *   zai-org/GLM-5-FP8               - native tool calling, reasoning
 *   zai-org/GLM-5.1-FP8             - 131k context
 *   qwen3.6-plus                    - 1M context, agentic coding
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../.env") });

const BASE_URL = process.env.LLM_BASE_URL || "https://router-api.0g.ai/v1";
const DEFAULT_MODEL = process.env.LLM_MODEL || "deepseek/deepseek-chat-v3-0324";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
  toolChoice?: "auto" | "none" | "required";
  responseFormat?: { type: "json_object" | "text" };
}

export interface ChatResponse {
  content: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  toolCalls?: Array<{ id: string; function: { name: string; arguments: string } }>;
}

export class ZeroGComputeProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.LLM_API_KEY || "";
    this.model = model || DEFAULT_MODEL;
    if (!this.apiKey) console.warn("[0G Compute] No API key. LLM calls will fail.");
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const body: any = {
      model: options.model || this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    };
    if (options.tools?.length) {
      body.tools = options.tools;
      body.tool_choice = options.toolChoice || "auto";
    }
    if (options.responseFormat) body.response_format = options.responseFormat;

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new LLMError(
        `0G Compute ${res.status}: ${err.error?.message || res.statusText}`,
        res.status
      );
    }

    const data = await res.json();
    const choice = data.choices[0];
    const msg = choice.message;

    return {
      content: msg.content || "",
      model: data.model,
      usage: data.usage,
      toolCalls: msg.tool_calls?.map((tc: any) => ({ id: tc.id, function: tc.function })),
    };
  }

  /** Decompose a task into subtasks (JSON output) */
  async decomposeTask(
    taskDescription: string,
    availableRoles: string[]
  ): Promise<{ subtasks: Array<{ description: string; assignTo: string; priority: number }> }> {
    const response = await this.chat(
      [
        {
          role: "system",
          content: `You are a task decomposition engine. Break complex tasks into subtasks and assign each to the best available role. Roles: ${availableRoles.join(", ")}. Respond with JSON only.`,
        },
        {
          role: "user",
          content: `Decompose: "${taskDescription}"\n\nJSON: { "subtasks": [{ "description": "...", "assignTo": "Role", "priority": 1-5 }] }`,
        },
      ],
      { responseFormat: { type: "json_object" }, temperature: 0.3 }
    );
    try {
      return JSON.parse(response.content);
    } catch {
      return { subtasks: [{ description: taskDescription, assignTo: availableRoles[0], priority: 3 }] };
    }
  }

  /** Evaluate a bid economically */
  async evaluateBid(params: {
    taskDescription: string;
    bidAmount: string;
    agentBudget: string;
    costSensitivity: number;
  }): Promise<{ accept: boolean; reason: string; counterOffer?: string }> {
    const response = await this.chat(
      [
        {
          role: "system",
          content: `Economic decision engine. Cost sensitivity: ${params.costSensitivity}/100. Respond JSON only.`,
        },
        {
          role: "user",
          content: `Task: "${params.taskDescription}"\nBid: ${params.bidAmount}\nBudget: ${params.agentBudget}\nAccept? JSON: { "accept": bool, "reason": "...", "counterOffer": "amount or null" }`,
        },
      ],
      { responseFormat: { type: "json_object" }, temperature: 0.2 }
    );
    try {
      return JSON.parse(response.content);
    } catch {
      return { accept: true, reason: "Default acceptance" };
    }
  }

  async listModels(): Promise<Array<{ id: string; name: string; context_length: number }>> {
    const res = await fetch(`${BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new LLMError(`Models list failed: ${res.status}`, res.status);
    const data = await res.json();
    return data.data.map((m: any) => ({ id: m.id, name: m.name, context_length: m.context_length }));
  }
}

export class LLMError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "LLMError";
  }
}

let _provider: ZeroGComputeProvider;
export function getLLM(): ZeroGComputeProvider {
  if (!_provider) _provider = new ZeroGComputeProvider();
  return _provider;
}
