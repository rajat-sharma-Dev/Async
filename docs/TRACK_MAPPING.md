# 🏆 TRACK_MAPPING.md — Hackathon Track Alignment

## Overview

AgentVerse integrates **all three hackathon tracks** deeply — not as add-ons, but as core architectural pillars.

---

## Track 1: 0G (Agents + Storage + Compute + iNFTs)

### How AgentVerse Uses 0G

| 0G Feature | AgentVerse Usage | Depth |
|-----------|-----------------|-------|
| **0G Chain** | All smart contracts deployed here (AgentNFT, TaskManager, Auction) | Core |
| **ERC-7857 iNFTs** | Every agent IS an iNFT — ownable, transferable, monetizable | Core |
| **0G Storage KV** | Agent persistent memory — personality state, context, learned patterns | Core |
| **0G Storage Logs** | Immutable task execution history, audit trail | Core |
| **Shared Memory** | Swarm coordination state (subtask status, intermediate results) | Core |

### Specific Implementations

1. **Agent Identity (ERC-7857)**
   - `AgentNFT.sol` — Full iNFT implementation with metadata management
   - Agents are minted as NFTs on 0G Chain
   - Metadata URI points to 0G Storage for personality + memory
   - Supports secure transfer (ownership + intelligence moves together)

2. **Persistent Memory (0G KV)**
   - `ZeroGMemory` class wraps `@0gfoundation/0g-ts-sdk`
   - Key schema: `agent:{id}:profile`, `agent:{id}:memory`, `agent:{id}:history`
   - Agents read memory on startup, write after every task
   - Swarm state stored in `swarm:{id}:*` namespace

3. **Task Data (0G Storage)**
   - Task results stored as immutable files on 0G Storage
   - Result hashes recorded on-chain in TaskManager contract
   - Full audit trail of all agent work

### Why This Satisfies 0G Track

✅ Uses 0G Chain as the primary smart contract platform  
✅ Implements ERC-7857 iNFTs as the core agent identity mechanism  
✅ Uses 0G Storage KV for all persistent agent memory  
✅ Demonstrates agents with embedded intelligence, upgradeability, and monetization  
✅ Shows real utility — not a wrapper, but a fundamental architectural choice  

---

## Track 2: Gensyn AXL (P2P Communication)

### How AgentVerse Uses AXL

| AXL Feature | AgentVerse Usage | Depth |
|------------|-----------------|-------|
| **P2P Mesh** | All agent-to-agent communication | Core |
| **No Central Broker** | Zero message servers — fully decentralized | Core |
| **NAT Traversal** | Agents work from any network | Core |
| **E2E Encryption** | Secure agent communication | Core |
| **A2A Protocol** | Agent-to-Agent message patterns | Core |

### Specific Implementations

1. **Agent Communication**
   - Every agent message goes through AXL: `POST /send`, `GET /recv`
   - Task broadcasts, bids, delegation, results, reviews — all via AXL
   - 12 message types defined in the protocol

2. **Peer Discovery**
   - Agents register their AXL peer ID on startup
   - Topology API used to discover network participants
   - Heartbeat messages maintain peer awareness

3. **Swarm Formation**
   - Swarm invites sent via AXL P2P messages
   - No central coordination service — agents self-organize
   - Coordinator communicates with all swarm members directly

4. **Multi-Node Architecture**
   - 2-3 AXL nodes running simultaneously
   - Each node hosts different agents
   - Messages route through encrypted mesh

### Why This Satisfies AXL Track

✅ AXL is THE communication layer — not optional, not a wrapper  
✅ Zero central message brokers — fully P2P  
✅ Multiple AXL nodes demonstrated  
✅ Uses AXL's A2A protocol for structured agent communication  
✅ Shows real emergent behavior enabled by P2P: swarm formation, delegation, adaptation  

---

## Track 3: KeeperHub + x402 (Payments)

### How AgentVerse Uses KeeperHub + x402

| Feature | AgentVerse Usage | Depth |
|---------|-----------------|-------|
| **x402 Protocol** | Agent-to-agent micropayments | Core |
| **HTTP 402** | Payment flow integrated into agent HTTP interactions | Core |
| **KeeperHub Execution** | Reliable payment settlement with retries | Core |
| **Gas Optimization** | KeeperHub handles gas management | Utilized |
| **USDC Payments** | Stablecoin-based agent economy | Core |

### Specific Implementations

1. **Agent Payment Client**
   - `X402Client` wraps fetch with automatic 402 challenge handling
   - Agents sign payments with their wallets
   - Transparent to agent logic — just HTTP calls

2. **KeeperHub Workflows**
   - Payment execution routed through KeeperHub API
   - Retry logic for failed settlements
   - Gas optimization for batch payments

3. **Payment Flows**
   - Task completion: Coordinator pays workers for subtasks
   - Delegation payment: Automatic payment on subtask completion
   - All payments logged and auditable

4. **Economic Intelligence**
   - Agent personality (cost sensitivity) influences bidding
   - Agents evaluate task economics before accepting work
   - Payment history informs future pricing decisions

### Why This Satisfies KeeperHub + x402 Track

✅ x402 is THE payment mechanism — agents transact autonomously  
✅ KeeperHub provides reliable execution infrastructure  
✅ Real economic behavior — bidding, pricing, payment distribution  
✅ No human-in-the-loop for payments — fully autonomous  
✅ Personality-driven economic decisions (not just simple transfers)  

---

## Cross-Track Synergy

The three tracks aren't just "used" — they're **architecturally intertwined**:

```
    0G (Identity + Memory)
         │
         ├── Agent exists as iNFT (0G Chain)
         ├── Agent remembers via 0G KV
         │
    AXL (Communication)
         │
         ├── Agent discovers tasks via AXL
         ├── Agent coordinates via AXL P2P
         │
    x402 + KeeperHub (Economy)
         │
         ├── Agent earns via x402 payments
         ├── Agent's economic history stored in 0G KV
         └── Payment triggers sent via AXL messages
```

**You cannot remove any track without breaking AgentVerse.** This is intentional — deep integration, not surface-level usage.

---

## Judging Angle

> "AgentVerse doesn't just use 0G, AXL, and KeeperHub. It shows what becomes possible ONLY when you combine all three: autonomous AI agents with persistent identity, decentralized communication, and an economic layer — creating an emergent civilization that no single technology could enable alone."
