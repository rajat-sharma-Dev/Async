# 💳 KEEPERHUB_X402.md — KeeperHub + x402 Integration

> **Source of truth:** [tracks-docs/KeepersHub-completedocs.md](./tracks-docs/KeepersHub-completedocs.md)

> **Implementation Status:**
> - ✅ KeeperHub API client (`src/payments/keeperhub.ts`)
> - ✅ x402 payment handler (`src/payments/x402.ts`)
> - ✅ Payment distribution (`src/payments/agent-payments.ts`)
> - ⏳ Agentic Wallet setup — needs `kh_` key + `npx keeperhub-wallet add`
> - ⏳ MCP Server integration — needs `kh_` key

---

## What KeeperHub Is

KeeperHub is the **execution and reliability layer** for agents operating onchain.

> *"Agents are great at reasoning, but they hit a wall when they need to actually move value: failed transactions, gas spikes, MEV extraction, zero guarantees."*

It provides: guaranteed onchain execution, retry logic, gas optimization, private routing, full audit trails.

---

## ⚠️ Chain Architecture — Critical Distinction

```
AgentVerse has TWO separate chains:

0G Chain (16602)                    Base (8453)
─────────────────                   ──────────────
Agent identity (AgentNFT)           USDC payments
Task lifecycle (TaskManager)        via KeeperHub x402
Auction (Auction.sol)
↑                                   ↑
ethers.js directly                  KeeperHub API
src/contracts/index.ts              src/payments/keeperhub.ts
```

**KeeperHub does NOT support 0G Chain.** It is used ONLY for:
1. USDC payment settlement on Base between agents
2. MCP workflow discovery at runtime
3. Execution reliability / audit trail for Base transactions

All 0G Chain interactions go through `src/contracts/index.ts` (ethers.js directly).

---

## How It Fits AgentVerse

The core problem KeeperHub solves:

| AgentVerse Scenario | Without KeeperHub | With KeeperHub |
|---|---|---|
| Coordinator pays 3 workers | Needs ETH for gas, tx might fail | USDC only, retry logic, guaranteed |
| Payment gets MEV-extracted | No protection | Private routing |
| Auditing who got paid what | Self-managed logs | Full audit trail |
| Agent calls paid service (x402) | Manual payment handling | Automatic 402 challenge resolution |

---

## x402 Protocol — Agent Payment Flow

x402 settles on **Base USDC** (chain 8453).

```
Task completes on 0G Chain (TaskManager records result)
    │
    ▼
Coordinator calls POST /execute/transfer via KeeperHub
    │
    ▼
KeeperHub agentic wallet signs EIP-3009 TransferWithAuthorization
    │
    ▼
Facilitator submits on-chain to Base — pays gas on behalf of agent
    │
    ▼
Worker wallets receive USDC on Base
    │
    ▼
KeeperHub returns executionId + audit trail
```

**Key facts:**
- Agents pay **USDC only** — no ETH/gas needed
- Facilitator covers gas
- Per-transfer cap: **100 USDC** (Turnkey-enforced)
- Daily cap: **200 USDC** (server-enforced)
- Auto-approve: ≤$5 | Ask: ≤$100 | Block: >$100

---

## Agentic Wallet Setup

```bash
# Install wallet skill
npx -p @keeperhub/wallet keeperhub-wallet skill install

# Provision wallet (creates ~/.keeperhub/wallet.json)
npx -p @keeperhub/wallet keeperhub-wallet add
```

`wallet.json` contains only an HMAC secret — **not a private key**. Signing is server-side via Turnkey.

---

## KeeperHub API

```
Base URL: https://app.keeperhub.com/api
Auth:     Authorization: Bearer kh_your_org_key
Rate:     60 req/min (direct exec), 100 req/min (API)
```

### Endpoints Used by AgentVerse

```bash
# Pay a worker agent (Base USDC)
POST /api/execute/transfer
{
  "network": "base",
  "recipientAddress": "0x...",
  "amount": "2.50",
  "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}

# Check payment status
GET /api/execute/{executionId}/status

# List available workflows (MCP discovery)
GET /api/workflows

# Execute a workflow
POST /api/workflow/{workflowId}/execute

# Check spending
GET /api/analytics/spend-cap
```

---

## MCP Integration

Agents discover available KeeperHub workflows at runtime via MCP:

```bash
# Add to Claude / agent runtime
claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp \
  --header "Authorization: Bearer kh_your_key"
```

Agents use two meta-tools:
- `search_workflows` — find workflows by tag/category
- `call_workflow` — execute a discovered workflow

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/payments/keeperhub.ts` | API client — Base USDC transfers + MCP workflows |
| `src/payments/x402.ts` | x402 402-challenge handler with retry + safety thresholds |
| `src/payments/agent-payments.ts` | Distribution strategies (equal / reputation-weighted) |

---

## Environment

```env
KH_API_KEY=kh_your_organization_api_key
# Get from: app.keeperhub.com → Settings → API Keys → Organisation
```

---

## CLI Reference

```bash
brew install keeperhub/tap/kh
kh auth login
kh workflow list
kh workflow run <workflow-id> --wait
```
