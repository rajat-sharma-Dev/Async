# 🔗 AXL_INTEGRATION.md — Gensyn AXL P2P Communication

## Overview

Gensyn AXL (Agent eXchange Layer) provides the peer-to-peer communication backbone for AgentVerse. It eliminates the need for any central message broker — agents discover and communicate directly via an encrypted mesh network.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  AXL Node 1 │◄───►│  AXL Node 2 │◄───►│  AXL Node 3 │
│  :9002      │     │  :9003      │     │  :9004      │
│             │     │             │     │             │
│ Agents:     │     │ Agents:     │     │ Agents:     │
│  Coordinator│     │  Developer  │     │  Critic     │
│  Researcher │     │  Trader     │     │             │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                    Yggdrasil Mesh
                  (Encrypted, NAT-traversing)
```

## Setup

### Building AXL

```bash
# Clone AXL repository
git clone https://github.com/gensyn-ai/axl.git
cd axl

# Build the Go binary
go build -o axl-node ./cmd/node/
```

### Node Configuration

```json
// packages/axl-nodes/node1-config.json
{
  "listen_port": 9002,
  "key_path": "./keys/node1.key",
  "bootstrap_peers": [],
  "log_level": "info"
}
```

```json
// packages/axl-nodes/node2-config.json
{
  "listen_port": 9003,
  "key_path": "./keys/node2.key",
  "bootstrap_peers": ["<node1_address>"],
  "log_level": "info"
}
```

### Starting Nodes

```bash
#!/bin/bash
# packages/axl-nodes/start-nodes.sh

# Start node 1 (bootstrap)
./axl-node -config node1-config.json &
sleep 2

# Start node 2 (connects to node 1)
./axl-node -config node2-config.json &
sleep 2

# Start node 3 (connects to node 1)
./axl-node -config node3-config.json &

echo "All AXL nodes started"
```

## API Reference

### Core Endpoints (per node)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/topology` | Network info + own public key |
| `POST` | `/send` | Send message to peer |
| `GET` | `/recv` | Poll for received messages |
| `POST` | `/mcp/*` | MCP tool sharing endpoints |
| `POST` | `/a2a/*` | Agent-to-Agent protocol endpoints |

### Get Node Identity

```bash
curl -s http://127.0.0.1:9002/topology | jq '.our_public_key'
```

### Send Message

```bash
curl -X POST http://127.0.0.1:9002/send \
  -H "X-Destination-Peer-Id: <DEST_PUBLIC_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"type":"TASK_BROADCAST","payload":{"taskId":"t-001","description":"Build a landing page"}}'
```

### Receive Messages

```bash
curl -s http://127.0.0.1:9002/recv
```

## TypeScript Wrapper

```typescript
// packages/backend/src/axl/client.ts

export class AXLClient {
  private baseUrl: string;
  private peerId: string | null = null;

  constructor(port: number = 9002) {
    this.baseUrl = `http://127.0.0.1:${port}`;
  }

  async getPeerId(): Promise<string> {
    if (!this.peerId) {
      const res = await fetch(`${this.baseUrl}/topology`);
      const data = await res.json();
      this.peerId = data.our_public_key;
    }
    return this.peerId!;
  }

  async send(destinationPeerId: string, message: AXLMessage): Promise<void> {
    await fetch(`${this.baseUrl}/send`, {
      method: 'POST',
      headers: {
        'X-Destination-Peer-Id': destinationPeerId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
  }

  async receive(): Promise<AXLMessage[]> {
    const res = await fetch(`${this.baseUrl}/recv`);
    if (res.status === 204) return [];
    return [await res.json()];
  }

  async broadcast(message: AXLMessage, peerIds: string[]): Promise<void> {
    await Promise.all(peerIds.map(pid => this.send(pid, message)));
  }

  async getTopology(): Promise<TopologyInfo> {
    const res = await fetch(`${this.baseUrl}/topology`);
    return res.json();
  }
}
```

## Message Protocol

### AXLMessage Format

```typescript
interface AXLMessage {
  type: MessageType;
  from: string;          // Sender AXL peer ID
  to: string;            // Receiver AXL peer ID (or 'broadcast')
  taskId?: string;       // Associated task
  swarmId?: string;      // Associated swarm
  payload: any;          // Type-specific data
  timestamp: number;
  nonce: string;         // Prevent replay attacks
}

type MessageType =
  | 'TASK_BROADCAST'
  | 'BID'
  | 'SWARM_INVITE'
  | 'SWARM_ACK'
  | 'DELEGATION'
  | 'PROGRESS'
  | 'RESULT'
  | 'REVIEW_REQUEST'
  | 'REVIEW_FEEDBACK'
  | 'ADAPTATION'
  | 'PAYMENT_REQUEST'
  | 'PAYMENT_CONFIRM'
  | 'HEARTBEAT';
```

## Peer Discovery

### Agent Registration

When an agent starts, it:
1. Connects to its assigned AXL node
2. Retrieves its peer ID from `/topology`
3. Registers peer ID in the backend's agent registry
4. Announces itself via broadcast to known peers

```typescript
async function registerAgent(agent: Agent, axl: AXLClient): Promise<void> {
  const peerId = await axl.getPeerId();
  agent.axlPeerId = peerId;
  
  // Announce to known peers
  await axl.broadcast({
    type: 'HEARTBEAT',
    from: peerId,
    to: 'broadcast',
    payload: { agentId: agent.id, role: agent.role, name: agent.name },
    timestamp: Date.now(),
    nonce: crypto.randomUUID()
  }, knownPeerIds);
}
```

### Peer Registry

The backend maintains a local registry mapping agent IDs to AXL peer IDs:

```typescript
// In-memory peer registry (backed by 0G KV for persistence)
const peerRegistry: Map<string, { agentId: string; peerId: string; role: AgentRole; lastSeen: number }> = new Map();
```

## Message Polling Loop

Each agent runs a continuous polling loop:

```typescript
async function messageLoop(agent: Agent, axl: AXLClient): Promise<void> {
  while (agent.isActive) {
    const messages = await axl.receive();
    for (const msg of messages) {
      await handleMessage(agent, msg);
    }
    await sleep(500); // 500ms poll interval
  }
}

async function handleMessage(agent: Agent, msg: AXLMessage): Promise<void> {
  switch (msg.type) {
    case 'TASK_BROADCAST':
      await handleTaskBroadcast(agent, msg);
      break;
    case 'DELEGATION':
      await handleDelegation(agent, msg);
      break;
    case 'REVIEW_REQUEST':
      await handleReviewRequest(agent, msg);
      break;
    case 'RESULT':
      await handleResult(agent, msg);
      break;
    // ... other handlers
  }
}
```

## Security

- **End-to-end encryption:** TLS for direct links + Yggdrasil for full path
- **Identity:** ed25519 keypairs per node
- **NAT traversal:** AXL handles connections behind NATs/firewalls
- **No root required:** Runs in userspace
