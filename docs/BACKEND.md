# ⚙️ BACKEND.md — Services, APIs & Agent Runtime

## Overview

The backend is a **Node.js + TypeScript** service that:
- Hosts the agent runtime engine
- Exposes REST + WebSocket APIs for the frontend
- Interfaces with AXL nodes for P2P messaging
- Manages 0G Storage reads/writes
- Orchestrates x402 payments via KeeperHub

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
        const messages = await axl.receive();
        for (const msg of messages) {
          await this.handleMessage(instance, msg);
        }
      } catch (err) {
        console.error(`Agent ${instance.agent.id} loop error:`, err);
      }
      await sleep(500);
    }
  }

  private async handleMessage(instance: AgentInstance, msg: AXLMessage): Promise<void> {
    this.eventEmitter.emit('agent:message', {
      from: msg.from, to: msg.to, type: msg.type,
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

```typescript
// packages/backend/src/llm/provider.ts

export interface LLMProvider {
  complete(prompt: string, options?: LLMOptions): Promise<string>;
  chat(messages: ChatMessage[], options?: LLMOptions): Promise<string>;
}

export class OpenAIProvider implements LLMProvider {
  async complete(prompt: string, options?: LLMOptions): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options?.model || process.env.LLM_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }
}

// Easily swap providers
export function createLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'openai';
  switch (provider) {
    case 'openai': return new OpenAIProvider();
    default: return new OpenAIProvider();
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
