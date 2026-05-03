# 🔗 AXL_INTEGRATION.md — Gensyn AXL P2P Communication

> **Source of truth:** [tracks-docs/AXL.md](../tracks-docs/AXL.md) — full official documentation

## Overview

Gensyn AXL (Agent eXchange Layer) is the peer-to-peer communication backbone for AgentVerse. It's a Go binary that creates an encrypted mesh network using Yggdrasil. Your application never touches the network directly — it talks to `http://127.0.0.1:9002` (the local HTTP bridge), and AXL handles all routing, encryption, and peer management.

**Key principle:** AXL enforces clean separation between the network layer (the node) and the application layer (your code). The node is a pipe — it moves encrypted bytes between peers but has no opinion about what those bytes mean.

## Architecture

```
      Rajat's Machine                                        Pranav's Machine
┌──────────────────────┐                                ┌──────────────────────┐
│  [AgentVerse Backend]│                                │  [AgentVerse Backend]│
│       ↕ HTTP         │                                │       ↕ HTTP         │
│  [AXL node :9002]    │         ◄── mesh ──►           │  [AXL node :9002]    │
└──────────────────────┘                                └──────────────────────┘
```

### Internal Node Architecture

```
                    localhost
             ┌──────────────────┐
             │                  │
Your App ◄───┤ HTTP API (:9002) │
             │                  │
             │   Multiplexer   ─┼──► MCP Router (:9003)  [Python]
             │        │         │
             │   gVisor TCP     ├──► A2A Server (:9004)   [Python]
             │        │         │
             │   Yggdrasil Core │
             │        │         │
             └────────┼─────────┘
                      │ TLS/TCP
                      ▼
                 Network Peers
```

## Prerequisites

| Tool | Required | Install |
|------|----------|---------|
| **Go 1.25.x** | Yes | `brew install go` (macOS) or [download](https://go.dev/dl/) |
| Python 3.9+ | For MCP/A2A | Usually pre-installed |
| pip packages | For MCP/A2A | `pip install textual requests` |

> ⚠️ **Go 1.26 compatibility issue:** The `gvisor.dev/gvisor` dependency has build tag conflicts with Go 1.26. If you only have Go 1.26+, prefix build commands with `GOTOOLCHAIN=go1.25.5`.

## Setup

### Step 1: Build the AXL Node Binary

```bash
git clone https://github.com/gensyn-ai/axl.git
cd axl
go build -o node ./cmd/node/
```

### Step 2: Generate Identity Keys

Each node needs a persistent ed25519 key:

```bash
# macOS (LibreSSL doesn't support ed25519, use Homebrew's OpenSSL)
brew install openssl
/opt/homebrew/opt/openssl/bin/openssl genpkey -algorithm ed25519 -out private.pem

# Generate a second key for the second node
/opt/homebrew/opt/openssl/bin/openssl genpkey -algorithm ed25519 -out private-2.pem
```

### Step 3: Configure Nodes

**Node A** (default config):
```json
// packages/axl-nodes/node-config.json
{
  "PrivateKeyPath": "private.pem",
  "Peers": []
}
```

**Node B** (different ports to run on same machine):
```json
// packages/axl-nodes/node-config-2.json
{
  "PrivateKeyPath": "private-2.pem",
  "Peers": [],
  "Listen": [],
  "api_port": 9012,
  "tcp_port": 7001
}
```

### Configuration Reference

#### Network Identity & Peering (PascalCase — Yggdrasil settings)

| Field | Type | Description |
|-------|------|-------------|
| `PrivateKeyPath` | string | Path to ed25519 PEM key. Omit for ephemeral identity. |
| `Peers` | string[] | Bootstrap peer URIs: `["tls://IP:9001"]` |
| `Listen` | string[] | Accept inbound connections: `["tls://0.0.0.0:9001"]` |

#### Node Settings (snake_case — AXL settings)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `api_port` | int | 9002 | HTTP interface port |
| `bridge_addr` | string | 127.0.0.1 | HTTP bind address (KEEP localhost!) |
| `tcp_port` | int | 7000 | Internal TCP listener port (gVisor) |
| `router_addr` | string | *(empty)* | MCP Router host. Empty = MCP disabled |
| `router_port` | int | 9003 | MCP Router port |
| `a2a_addr` | string | *(empty)* | A2A Server host. Empty = A2A disabled |
| `a2a_port` | int | 9004 | A2A Server port |
| `max_message_size` | int | 16777216 | Max message size (16 MB default) |

### Step 4: Start Nodes

```bash
#!/bin/bash
# packages/axl-nodes/start-nodes.sh

# Start Node A (default ports: api=9002, tcp=7000)
./node -config node-config.json &
sleep 2

# Start Node B (custom ports: api=9012, tcp=7001)
./node -config node-config-2.json &
sleep 2

echo "Both AXL nodes started"
echo "Node A API: http://127.0.0.1:9002"
echo "Node B API: http://127.0.0.1:9012"
```

### Step 5: Verify + Quick Test

```bash
# Get Node A's public key
NODE_A_KEY=$(curl -s http://127.0.0.1:9002/topology | python3 -c "import sys,json; print(json.load(sys.stdin)['our_public_key'])")

# Get Node B's public key
NODE_B_KEY=$(curl -s http://127.0.0.1:9012/topology | python3 -c "import sys,json; print(json.load(sys.stdin)['our_public_key'])")

# Send from B → A
curl -X POST http://127.0.0.1:9012/send \
  -H "X-Destination-Peer-Id: $NODE_A_KEY" \
  -d "hello from node B"

# Receive on A
sleep 1
curl -v http://127.0.0.1:9002/recv
# Response body: "hello from node B"
# Header X-From-Peer-Id: <Node B's public key>
```

---

## API Reference

### Core Endpoints (per node)

| Method | Endpoint | Headers | Description |
|--------|----------|---------|-------------|
| `GET` | `/topology` | — | Network info: `our_public_key`, `our_ipv6`, `peers`, `tree` |
| `POST` | `/send` | `X-Destination-Peer-Id: <key>` | Send raw bytes to peer (fire-and-forget) |
| `GET` | `/recv` | — | Poll message queue. Returns `X-From-Peer-Id` header |
| `POST` | `/mcp/{peer_id}/{service}` | `Content-Type: application/json` | Call remote MCP service |
| `GET/POST` | `/a2a/{peer_id}` | — | A2A agent card / send request |

### Envelope Routing (Inbound Messages)

The multiplexer inspects each inbound message and routes based on content:

| Envelope Pattern | Routed To |
|-----------------|-----------|
| `{"service": "...", "request": {...}}` | MCP Router (:9003) |
| `{"a2a": true, "request": {...}}` | A2A Server (:9004) |
| Anything else | Message queue (your app reads via `/recv`) |

---

## Three Communication Patterns for AgentVerse

### Pattern 1: Send/Recv (Fire-and-Forget) — **PRIMARY for AgentVerse**

Simplest pattern. Best for our agent-to-agent messaging.

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

  async getTopology(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/topology`);
    return res.json();
  }

  async send(destinationPeerId: string, message: any): Promise<void> {
    await fetch(`${this.baseUrl}/send`, {
      method: 'POST',
      headers: {
        'X-Destination-Peer-Id': destinationPeerId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
  }

  async receive(): Promise<{ from: string; data: any } | null> {
    const res = await fetch(`${this.baseUrl}/recv`);
    if (res.status !== 200) return null;
    const from = res.headers.get('X-From-Peer-Id') || 'unknown';
    const data = await res.json();
    return { from, data };
  }

  async broadcast(message: any, peerIds: string[]): Promise<void> {
    await Promise.all(peerIds.map(pid => this.send(pid, message)));
  }
}
```

### Pattern 2: MCP Services (Request-Response) — **For agent tool sharing**

Agents can expose tools (code execution, research, review) as MCP services. Other agents call them remotely.

**Setup requires:**
1. MCP Router (Python process on :9003)
2. Your service registered with the router
3. Node config with `router_addr` set

```bash
# Start MCP Router
cd axl/integrations
pip install -e .
python -m mcp_routing.mcp_router --port 9003

# Register a service
curl -X POST http://127.0.0.1:9003/register \
  -H "Content-Type: application/json" \
  -d '{"service": "agent-tools", "endpoint": "http://127.0.0.1:7100/mcp"}'
```

**Node config with MCP enabled:**
```json
{
  "PrivateKeyPath": "private.pem",
  "Peers": [],
  "router_addr": "http://127.0.0.1",
  "router_port": 9003
}
```

**Remote call from another node:**
```bash
curl -X POST http://127.0.0.1:9012/mcp/{peer_id}/agent-tools \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1,"params":{}}'
```

### Pattern 3: A2A (Agent-to-Agent) — **For discoverable agent services**

A2A wraps MCP services as discoverable A2A skills. Other agents can discover what skills you offer via `/.well-known/agent.json`.

```bash
# Start A2A server (requires MCP Router running)
python -m a2a_serving.a2a_server --port 9004 --router http://127.0.0.1:9003
```

**Node config:**
```json
{
  "router_addr": "http://127.0.0.1",
  "router_port": 9003,
  "a2a_addr": "http://127.0.0.1",
  "a2a_port": 9004
}
```

---

## AgentVerse-Specific Design Decisions

### Which Pattern to Use Where

| Use Case | Pattern | Why |
|----------|---------|-----|
| Task broadcasts | Send/Recv | Fire-and-forget to all peers |
| Bids, delegation, results | Send/Recv | Simple, fast, agent handles logic |
| Agent tool invocation | MCP | Structured request-response for tool calls |
| Agent discovery | A2A | Auto-discoverable agent capabilities |
| Swarm coordination | Send/Recv | Custom protocol, agent-driven |

### MVP Strategy

For MVP, we use **Send/Recv (Pattern 1)** for all communication:
- Simpler to implement
- Agents manage their own message protocol
- No MCP Router or A2A Server needed initially
- Can add MCP/A2A as a stretch goal

### Message Protocol

```typescript
interface AgentMessage {
  type: 'TASK_BROADCAST' | 'BID' | 'SWARM_INVITE' | 'SWARM_ACK'
    | 'DELEGATION' | 'PROGRESS' | 'RESULT' | 'REVIEW_REQUEST'
    | 'REVIEW_FEEDBACK' | 'ADAPTATION' | 'PAYMENT_REQUEST'
    | 'PAYMENT_CONFIRM' | 'HEARTBEAT';
  from: string;        // Agent ID (not AXL peer ID — mapped in registry)
  taskId?: string;
  swarmId?: string;
  payload: any;
  timestamp: number;
  nonce: string;
}
```

### Peer Registry

Maps agent IDs to AXL peer IDs (since multiple agents can share one AXL node):

```typescript
const peerRegistry = new Map<string, {
  agentId: string;
  axlPeerId: string;    // 64-char hex public key
  axlPort: number;       // Which local AXL node (9002 or 9012)
  role: string;
  lastSeen: number;
}>();
```

### Message Polling Loop

```typescript
async function messageLoop(agent: Agent, axl: AXLClient): Promise<void> {
  while (agent.isActive) {
    const msg = await axl.receive();
    if (msg) {
      await handleMessage(agent, msg.from, msg.data);
    }
    await sleep(200); // 200ms poll interval (match AXL docs recommendation)
  }
}
```

---

## Security Notes

- **E2E Encryption:** Two layers — TLS for direct peering links + Yggdrasil end-to-end encryption for full path
- **Routing nodes cannot read messages** — they only relay encrypted bytes
- **Identity = ed25519 public key** — 64-char hex, treat private.pem like an SSH key
- **No access control** — any node with your public key can send to you. **Your app must validate senders.**
- **No service registry** — keys must be exchanged directly between agents
- **bridge_addr must stay 127.0.0.1** — never expose to 0.0.0.0 unless you understand the risks
- **Message queue is non-persistent** — empties on restart (that's fine, we use 0G KV for persistence)

---

## For Implementation: Reference Checklist

When implementing AXL integration, refer to:
- **Setup:** [tracks-docs/AXL.md](../tracks-docs/AXL.md) → "Get Started" section
- **Config:** [tracks-docs/AXL.md](../tracks-docs/AXL.md) → "Configuration" section
- **Building:** [tracks-docs/AXL.md](../tracks-docs/AXL.md) → "Building Applications & Examples" section
- **TypeScript wrapper:** This file → "Pattern 1: Send/Recv" section
- **Message types:** [INTERFACES.md](./INTERFACES.md) → "AXL Message Types" section
