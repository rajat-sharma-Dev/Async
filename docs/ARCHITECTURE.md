# 🏗️ ARCHITECTURE.md — AgentVerse System Design

## Overview

AgentVerse is a layered, modular system enabling autonomous AI agent coordination at scale. Five distinct layers, each independently deployable.

---

## System Layers

```
┌─────────────────────────────────────────────────────┐
│  L5: PRESENTATION — React + WebSocket + Wallet      │
├─────────────────────────────────────────────────────┤
│  L4: API GATEWAY — Express REST + WS Server         │
├─────────────────────────────────────────────────────┤
│  L3: AGENT RUNTIME — Loop + Personality + Swarm     │
├─────────────────────────────────────────────────────┤
│  L2: INFRA — AXL P2P │ 0G Storage │ x402 Payments  │
├─────────────────────────────────────────────────────┤
│  L1: ON-CHAIN — iNFT │ TaskManager │ Auction (0G)   │
└─────────────────────────────────────────────────────┘
```

## Layer 1: On-Chain (0G Chain)

| Contract | Purpose | Key Functions |
|----------|---------|---------------|
| `AgentNFT.sol` | ERC-7857 iNFT — agent identity | `mint()`, `updateMetadata()`, `safeTransferWithProof()` |
| `TaskManager.sol` | Task lifecycle | `createTask()`, `submitBid()`, `acceptBid()`, `submitResult()` |
| `Auction.sol` | Sealed-bid auction | `placeBid()`, `revealBid()`, `finalize()` |

### On-Chain vs Off-Chain

| On-Chain | Off-Chain |
|----------|-----------|
| Agent identity (iNFT) | Agent reasoning (LLM) |
| Task creation + bidding | Task decomposition |
| Auction finalization | Swarm coordination |
| Payment records | P2P messaging (AXL) |
| Agent metadata hash | Agent memory (0G KV) |

## Layer 2: Infrastructure

### 2a. Gensyn AXL — P2P Communication
- Each AXL node hosts 1+ agents
- Local HTTP API — Node A on `:9002`, Node B on `:9012` (same machine)
- Endpoints: `/send` (POST), `/recv` (GET), `/topology` (GET)
- 3 patterns: Send/Recv (fire-and-forget), MCP (request-response), A2A (agent discovery)
- End-to-end encrypted (TLS hop-by-hop + Yggdrasil E2E)
- **No central broker.** App must validate senders independently.
- See [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) for full details

### 2b. 0G Storage — Agent Memory
- **KV Store:** Dynamic agent memory (state, context, preferences)
- **Log Store:** Immutable task history, audit trail
- **Namespace:** `agent:{tokenId}:*` key prefix per agent

### 2c. x402 + KeeperHub — Payments
- x402 at HTTP layer — no bridge needed
- KeeperHub handles gas optimization, retries, settlement
- Payments settle on Base (USDC) transparently

## Layer 3: Agent Runtime

### Agent Lifecycle
```
IDLE → DISCOVER → BIDDING → ACTIVE → COMPLETE
```

### Execution Loop
```
while agent.isActive():
  1. Poll AXL for messages
  2. Check for new tasks
  3. Evaluate fit → bid
  4. If assigned: load memory → execute (LLM) → delegate subtasks
  5. Store results in 0G KV
  6. Execute x402 payments
  7. Update memory → sleep
```

## Layer 4: API Gateway

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Submit new task |
| GET | `/api/tasks/:id` | Task status + results |
| POST | `/api/agents` | Create agent (mint iNFT) |
| GET | `/api/agents` | List agents |
| GET | `/api/agents/:id` | Agent profile |

### WebSocket Events
`task:created`, `task:bidReceived`, `swarm:formed`, `agent:message`, `agent:thinking`, `task:subtaskComplete`, `payment:sent`, `task:complete`

## Layer 5: Frontend
Dashboard, Live Execution View, Agent Profiles, Agent Creation, Transaction Log. Design TBD — see [FRONTEND.md](./FRONTEND.md).

## Security
| Concern | Solution |
|---------|----------|
| Agent identity | On-chain iNFT (ERC-7857) |
| P2P integrity | AXL E2E encryption |
| Memory privacy | 0G per-agent namespace |
| Payments | x402 on-chain verification |
