# ⚙️ BACKEND.md — Services, APIs & Agent Runtime

## Overview

The backend is a **Node.js + TypeScript** service that:
- Hosts the agent runtime engine
- Exposes REST + WebSocket APIs for the frontend
- Interfaces with AXL nodes for P2P messaging (Node A `:9002`, Node B `:9012`)
- Manages 0G Storage reads/writes
- Orchestrates x402 payments via KeeperHub

> **AXL Reference:** See [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) and [tracks-docs/AXL.md](./tracks-docs/AXL.md) for full AXL details.

> **Implementation Status:**
> - ✅ Express + WebSocket server: `packages/backend/src/server.ts`
> - ✅ 0G Storage KV wrapper: `packages/backend/src/storage/zerog.ts`
> - ✅ LLM provider (0G Compute): defined below, ready to implement as `src/llm/provider.ts`
> - ⬜ AXL TypeScript client: `src/axl/client.ts` (Pranav)
> - ⬜ Agent runtime loop: `src/agents/runtime.ts` (Pranav)
> - ⬜ API routes: tasks, agents, payments (Phase 2)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Express Server                   │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ REST API │  │ WebSocket│  │ Event Emitter│  │
│  │ /api/*   │  │ Server   │  │              │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │          │
│  ┌────▼──────────────▼───────────────▼────────┐ │
│  │           Agent Runtime Engine              │ │
│  │                                             │ │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────────┐ │ │
│  │  │Agents[] │ │ Swarm    │ │ Task        │ │ │
│  │  │Runtime  │ │ Manager  │ │ Decomposer  │ │ │
│  │  └────┬────┘ └────┬─────┘ └──────┬──────┘ │ │
│  └───────┼───────────┼──────────────┼─────────┘ │
│          │           │              │            │
│  ┌───────▼───────────▼──────────────▼─────────┐ │
│  │         Infrastructure Clients              │ │
│  │  ┌─────┐ ┌──────┐ ┌──────┐ ┌───────────┐  │ │
│  │  │ AXL │ │ 0G   │ │ x402 │ │ LLM       │  │ │
│  │  │Client│ │Memory│ │Client│ │ Provider  │  │ │
│  │  └─────┘ └──────┘ └──────┘ └───────────┘  │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Project Structure

```
packages/backend/
├── src/
│   ├── server.ts              # Express + WebSocket entry point
│   ├── config.ts              # Environment config
│   ├── agents/
│   │   ├── runtime.ts         # Agent execution loop
│   │   ├── personality.ts     # Personality → system prompt
│   │   ├── types.ts           # Type definitions
│   │   └── memory.ts          # Memory read/write (0G)
│   ├── swarm/
│   │   ├── coordinator.ts     # Swarm formation + management
│   │   ├── auction.ts         # Bidding logic (off-chain scoring)
│   │   └── decomposer.ts      # Task → subtasks (LLM)
│   ├── axl/
│   │   ├── client.ts          # AXL HTTP API wrapper
│   │   ├── discovery.ts       # Peer discovery
│   │   └── messaging.ts       # Message protocol + handlers
│   ├── payments/
│   │   ├── x402.ts            # x402 payment client
│   │   └── keeper.ts          # KeeperHub integration
│   ├── storage/
│   │   └── zerog.ts           # 0G KV client
│   ├── llm/
│   │   └── provider.ts        # LLM abstraction (pluggable)
│   └── routes/
│       ├── tasks.ts           # Task endpoints
│       ├── agents.ts          # Agent endpoints
│       └── payments.ts        # Payment endpoints
├── package.json
└── tsconfig.json
```

## API Endpoints

### Tasks

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/tasks` | `{ description, budget }` | Submit new task |
| `GET` | `/api/tasks` | — | List all tasks |
| `GET` | `/api/tasks/:id` | — | Get task details + result |
| `GET` | `/api/tasks/:id/bids` | — | Get bids for task |
| `GET` | `/api/tasks/:id/swarm` | — | Get swarm for task |

### Agents

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/agents` | `{ name, role, personality }` | Create agent (mints iNFT) |
| `GET` | `/api/agents` | — | List all agents |
| `GET` | `/api/agents/:id` | — | Agent profile |
| `GET` | `/api/agents/:id/memory` | — | Agent memory from 0G |
| `PATCH` | `/api/agents/:id` | `{ personality }` | Update personality |

### Payments

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/payments` | — | All payment history |
| `GET` | `/api/payments/agent/:id` | — | Payments for agent |

## WebSocket Events

### Server → Client

```typescript
// Task lifecycle
ws.emit('task:created', { taskId, description, budget });
ws.emit('task:bidsOpen', { taskId, deadline });
ws.emit('task:bidReceived', { taskId, agentId, agentName, amount, role });
ws.emit('swarm:formed', { taskId, swarmId, agents: AgentInfo[], coordinatorId });
ws.emit('task:decomposed', { taskId, subtasks: Subtask[] });
ws.emit('task:subtaskAssigned', { taskId, subtaskId, agentId });
ws.emit('task:subtaskComplete', { taskId, subtaskId, result });
ws.emit('task:complete', { taskId, finalResult, payments: PaymentInfo[] });

// Agent activity (real-time visualization)
ws.emit('agent:thinking', { agentId, thought: string });
ws.emit('agent:message', { from, to, type, content, timestamp });
ws.emit('agent:adaptation', { agentId, oldStrategy, newStrategy, reason });

// Payments
ws.emit('payment:initiated', { from, to, amount, reason });
ws.emit('payment:confirmed', { txHash, from, to, amount });
```

## Agent Runtime Engine

```typescript
// packages/backend/src/agents/runtime.ts

export class AgentRuntime {
  private agents: Map<string, AgentInstance> = new Map();
  private axlClients: Map<string, AXLClient> = new Map();
  private memory: ZeroGMemory;
  private llm: LLMProvider;
  private eventEmitter: EventEmitter;

  async startAgent(agent: Agent): Promise<void> {
    const axl = this.axlClients.get(agent.axlNodeId)!;
    const peerId = await axl.getPeerId();
    
    const instance: AgentInstance = {
      agent: { ...agent, axlPeerId: peerId },
      isActive: true,
      currentTask: null
    };
    
    this.agents.set(agent.id, instance);
    
    // Load persistent memory from 0G
    const mem = await this.memory.getMemory(agent.id, 'memory');
    instance.agent.context = mem?.recentContext || '';
    
    // Start message loop
    this.runMessageLoop(instance, axl);
  }

  private async runMessageLoop(instance: AgentInstance, axl: AXLClient): Promise<void> {
    while (instance.isActive) {
      try {
        // AXL /recv returns one message at a time with X-From-Peer-Id header
        const msg = await axl.receive();
        if (msg) {
          await this.handleMessage(instance, msg.from, msg.data);
        }
      } catch (err) {
        console.error(`Agent ${instance.agent.id} loop error:`, err);
      }
      await sleep(200); // 200ms poll interval per AXL docs
    }
  }

  private async handleMessage(instance: AgentInstance, fromPeerId: string, data: any): Promise<void> {
    // data is our AgentMessage JSON (parsed from AXL raw bytes)
    const msg = data as AgentMessage;
    
    this.eventEmitter.emit('agent:message', {
      from: msg.from, to: instance.agent.id, type: msg.type,
      content: JSON.stringify(msg.payload),
      timestamp: msg.timestamp
    });

    switch (msg.type) {
      case 'TASK_BROADCAST':
        await this.evaluateTask(instance, msg.payload);
        break;
      case 'DELEGATION':
        await this.executeSubtask(instance, msg.payload);
        break;
      case 'REVIEW_REQUEST':
        await this.reviewOutput(instance, msg.payload);
        break;
      case 'RESULT':
        await this.aggregateResult(instance, msg.payload);
        break;
    }
  }

  private async evaluateTask(instance: AgentInstance, task: Task): Promise<void> {
    const decision = await shouldBidOnTask(instance.agent, task, this.llm);
    
    this.eventEmitter.emit('agent:thinking', {
      agentId: instance.agent.id,
      thought: `Evaluating task "${task.description}". Confidence: ${decision.confidence}. Will bid: ${decision.shouldBid}`
    });

    if (decision.shouldBid) {
      // Submit bid via AXL
      const axl = this.axlClients.get(instance.agent.axlNodeId)!;
      await axl.send(task.coordinatorPeerId || 'broadcast', {
        type: 'BID',
        from: instance.agent.axlPeerId,
        to: 'coordinator',
        payload: {
          agentId: instance.agent.id,
          amount: decision.bidAmount,
          confidence: decision.confidence,
          role: instance.agent.role,
          proposal: decision.proposal
        },
        timestamp: Date.now(),
        nonce: crypto.randomUUID()
      });
    }
  }
}
```

## LLM Provider Abstraction

> **0G Compute Router is the default LLM provider.** It's an OpenAI-compatible API backed by decentralized TEE-verified GPU providers. See [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "0G Compute" for full details.

```typescript
// packages/backend/src/llm/provider.ts

export interface LLMProvider {
  complete(prompt: string, options?: LLMOptions): Promise<string>;
  chat(messages: ChatMessage[], options?: LLMOptions): Promise<string>;
}

/**
 * 0G Compute Router — Decentralized, TEE-verified LLM inference
 * OpenAI-compatible API at router-api.0g.ai/v1
 */
export class ZeroGComputeProvider implements LLMProvider {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.LLM_BASE_URL || 'https://router-api.0g.ai/v1';
    this.apiKey = process.env.LLM_API_KEY || '';
  }

  async complete(prompt: string, options?: LLMOptions): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || process.env.LLM_MODEL || 'zai-org/GLM-5-FP8',
        messages,
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7,
        verify_tee: true, // Cryptographic proof the model actually ran
      }),
    });

    const data = await res.json();

    // Log cost and TEE verification for transparency
    if (data.x_0g_trace) {
      console.log(`[0G] Cost: ${data.x_0g_trace.billing?.total_cost} neuron, ` +
        `TEE: ${data.x_0g_trace.tee_verified}`);
    }

    return data.choices[0].message.content;
  }
}

/**
 * OpenAI fallback — for testing or if 0G Compute is unavailable
 */
export class OpenAIProvider implements LLMProvider {
  async complete(prompt: string, options?: LLMOptions): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages,
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7,
      }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }
}

// Default to 0G Compute — fully decentralized inference
export function createLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || '0g';
  switch (provider) {
    case '0g': return new ZeroGComputeProvider();
    case 'openai': return new OpenAIProvider();
    default: return new ZeroGComputeProvider();
  }
}
```

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "ws": "^8.16.0",
    "ethers": "^6.11.0",
    "@0gfoundation/0g-ts-sdk": "latest",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "@types/express": "^4.17.0",
    "@types/ws": "^8.5.0",
    "@types/cors": "^2.8.0"
  }
}
```
