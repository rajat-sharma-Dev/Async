# 🏆 TRACK_MAPPING.md — Hackathon Track Alignment

## Overview

AgentVerse integrates **all three hackathon tracks** deeply — not as add-ons, but as core architectural pillars.

> **Key selling point:** ZERO centralized dependencies.
> Agent identity → 0G Chain | Agent memory → 0G Storage | Agent thinking → 0G Compute | Agent comms → AXL P2P | Agent payments → KeeperHub x402

---

## Track 1: 0G (Chain + Storage + Compute)

### How AgentVerse Uses 0G

| 0G Product | AgentVerse Usage | Depth |
|-----------|-----------------|-------|
| **0G Chain** | All smart contracts (AgentNFT, TaskManager, Auction) | Core |
| **ERC-7857 iNFTs** | Every agent IS an iNFT — ownable, transferable, monetizable | Core |
| **0G Storage KV** | Agent persistent memory — personality state, context, task history | Core |
| **0G Compute Router** | **LLM inference for all agent thinking** — decentralized, TEE-verified | Core |

### Specific Implementations

1. **Agent Identity (ERC-7857 iNFTs on 0G Chain)**
   - `AgentNFT.sol` — ERC-721 Enumerable with roles, reputation, earnings
   - Deployed on 0G Chain (testnet 16602, EVM cancun)
   - Metadata URI points to 0G Storage for personality + memory
   - Source: `packages/contracts/contracts/AgentNFT.sol` ✅ Compiled

2. **Persistent Memory (0G Storage KV)**
   - `ZeroGMemory` class wraps CLI (stream-id per agent tokenId)
   - Keys: `state`, `memory`, `task_history` per stream
   - Agents read memory on startup, write after every task
   - Source: `packages/backend/src/storage/zerog.ts` ✅ Built

3. **Agent Thinking (0G Compute Router)**
   - `ZeroGComputeProvider` — OpenAI-compatible client
   - API: `https://router-api.0g.ai/v1`
   - Model: `zai-org/GLM-5-FP8` (supports streaming, tool calling, JSON mode)
   - TEE-verified: cryptographic proof the model actually ran
   - Completely replaces OpenAI — no centralized LLM dependency
   - Source: defined in `BACKEND.md`, to implement as `src/llm/provider.ts`

4. **Task Data (0G Storage)**
   - Task results stored as immutable entries on 0G Storage
   - Result hashes recorded on-chain in TaskManager contract
   - Full audit trail of all agent work

### Why This Satisfies 0G Track

✅ Uses **all three 0G products** (Chain + Storage + Compute)
✅ 0G Chain as the primary smart contract platform (3 contracts)
✅ 0G Storage KV for all persistent agent memory
✅ **0G Compute for ALL LLM inference** — no OpenAI, fully decentralized
✅ TEE-verified inference gives agents cryptographic proof of reasoning
✅ Deep integration — not wrappers, but fundamental architecture

---

## Track 2: Gensyn AXL (P2P Communication)

### How AgentVerse Uses AXL

| AXL Feature | AgentVerse Usage | Depth |
|------------|-----------------|-------|
| **P2P Mesh** | All agent-to-agent communication | Core |
| **No Central Broker** | Zero message servers — fully decentralized | Core |
| **Yggdrasil Encryption** | Transport-layer encrypted agent messages | Core |
| **Send/Recv Pattern** | 200ms polling, single-message retrieval | Core |

### Specific Implementations

1. **Agent Communication**
   - Every agent message goes through AXL: `POST /send`, `GET /recv`
   - `/recv` returns `X-From-Peer-Id` header for sender authentication
   - 200ms polling interval, single message per recv call
   - Source: `packages/axl-nodes/` ✅ Configs ready

2. **Multi-Node Architecture**
   - Node A: port 9002 (api), 7000 (tcp)
   - Node B: port 9012 (api), 7001 (tcp)
   - Config format: PascalCase (Yggdrasil) + snake_case (AXL)
   - Go 1.25.x required (NOT 1.26)

3. **Swarm Formation via P2P**
   - Task broadcasts, bids, delegation — all via AXL
   - No central coordination — agents self-organize
   - Coordinator communicates with swarm members directly

### Why This Satisfies AXL Track

✅ AXL is THE communication layer — not optional
✅ Zero central message brokers — fully P2P
✅ Multiple AXL nodes demonstrated
✅ Correct API usage (polling, X-From-Peer-Id, topology)
✅ Emergent swarm behavior enabled by P2P

---

## Track 3: KeeperHub + x402 (Payments + Automation)

### Chain Separation — Critical Architecture Note

```
0G Chain (16602)     ← agent identity, tasks, auctions (ethers.js)
Base Chain (8453)    ← USDC payments via KeeperHub x402
```

KeeperHub **does NOT support 0G Chain**. It is the payment and reliability layer for Base USDC only.

### How AgentVerse Uses KeeperHub + x402

| Feature | AgentVerse Usage | Depth |
|---------|-----------------|-------|
| **x402 Protocol** | Agent-to-agent micropayments in USDC on Base | Core |
| **Agentic Wallet** | Turnkey-backed wallets — agents pay USDC, no gas needed | Core |
| **Direct Execution `/execute/transfer`** | Coordinator pays workers after task completes | Core |
| **MCP Server** | Agents discover available workflows at runtime | Extended |
| **Audit Trail** | Every payment logged with executionId + tx hash | Extended |

### Specific Implementations

1. **x402 Payments (Base USDC)**
   - Tasks priced in USDC, settled on Base (chain 8453) via KeeperHub
   - EIP-3009 TransferWithAuthorization — agents pay NO gas
   - Facilitator submits on-chain, handles gas
   - Per-transfer cap: 100 USDC | Daily cap: 200 USDC
   - Source: `src/payments/x402.ts` ✅ Built

2. **Agentic Wallets**
   - KeeperHub wallet via `@keeperhub/wallet` (Turnkey-backed)
   - No private key on disk — HMAC secret only
   - Safety: auto ≤$5 | ask ≤$100 | block >$100
   - Source: setup docs in `KEEPERHUB_X402.md` ⏳ Needs `kh_` key

3. **Payment Distribution**
   - Coordinator calls `payAgent()` → KeeperHub `POST /execute/transfer`
   - Strategies: equal share or reputation-weighted
   - Retries + audit trail from KeeperHub
   - Source: `src/payments/agent-payments.ts` ✅ Built | `src/payments/keeperhub.ts` ✅ Built

4. **MCP Integration**
   - Agents use `search_workflows` + `call_workflow` meta-tools
   - Discover available automation at runtime
   - KeeperHub MCP at `https://app.keeperhub.com/mcp`

### Why This Satisfies KeeperHub + x402 Track

✅ x402 is THE payment mechanism — agents transact autonomously
✅ Agentic wallets with proper safety hooks (not raw key management)
✅ Uses Direct Execution API for contract calls
✅ MCP integration for runtime workflow discovery
✅ Real economic behavior — bidding, pricing, payment distribution
✅ Personality-driven economic decisions (not just simple transfers)

---

## Cross-Track Synergy

```
Agent is born → 0G Chain (iNFT minted)
    │
Agent loads personality → 0G Storage KV (memory read)
    │
Agent joins network → AXL P2P (peer discovery)
    │
Agent receives task → AXL (message recv)
    │
Agent THINKS → 0G Compute (TEE-verified LLM)
    │
Agent coordinates swarm → AXL (P2P messages)
    │
Agent completes work → 0G Storage (result stored)
    │
Agent gets paid → KeeperHub x402 (Base USDC)
    │
Agent updates memory → 0G Storage KV (learnings saved)
```

**You cannot remove any track without breaking AgentVerse.** This is intentional.

---

## Judging Angle

> "AgentVerse is a **fully decentralized AI civilization** with zero centralized dependencies:
>
> - No OpenAI → **0G Compute** (TEE-verified)
> - No Firebase → **0G Storage** (decentralized KV)
> - No message broker → **AXL P2P** (mesh network)
> - No Stripe → **x402** (autonomous micropayments)
>
> Every component is decentralized, verifiable, and composable. AgentVerse shows what becomes possible ONLY when you combine all three tracks."
