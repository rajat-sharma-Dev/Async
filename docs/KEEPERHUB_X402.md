# 💳 KEEPERHUB_X402.md — KeeperHub + x402 Payment Integration

> **Source of truth:** [tracks-docs/KeepersHub-completedocs.md](./tracks-docs/KeepersHub-completedocs.md)

> **Implementation Status:**
> - ⬜ Agentic Wallet setup
> - ⬜ x402 payment handler
> - ⬜ KeeperHub API client
> - ⬜ Direct Execution integration
> - ⬜ Payment flow wiring

---

## Overview

KeeperHub is a **Web3 automation platform** that provides:
1. **x402 payments** — USDC micropayments on Base (chain 8453) via signed authorization
2. **Agentic Wallets** — Turnkey-backed wallets for agents (no private keys on disk)
3. **Direct Execution API** — Execute blockchain transactions without workflows
4. **Workflow Automation** — Visual workflow builder with triggers + actions
5. **MCP Server** — AI agents discover and call workflows at runtime

### How AgentVerse Uses KeeperHub

| Use Case | KeeperHub Feature | Details |
|----------|-------------------|---------|
| Agent-to-agent payments | **x402 + Agentic Wallet** | Coordinator pays workers in USDC on Base |
| Contract interactions | **Direct Execution API** | Agents call 0G contracts via KeeperHub infra |
| Automated monitoring | **Workflows** | Monitor agent health, balance alerts |
| Agent tool discovery | **MCP Server** | Agents discover available tools at runtime |

---

## x402 Protocol — How Agent Payments Work

x402 settles on **Base USDC** (chain 8453). The flow:

```
Agent A wants to pay Agent B for completed work
    │
    ▼
Agent A calls Agent B's paid endpoint
    │
    ▼
Agent B returns HTTP 402 with payment challenge
    │
    ▼
Agent A's agentic wallet signs EIP-3009 TransferWithAuthorization
    │
    ▼
x402 facilitator submits on-chain, pays gas
    │
    ▼
Agent B receives USDC, returns result
```

**Key facts:**
- Payments are in **USDC on Base** (address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Agent pays ONLY the USDC amount — **no ETH/gas needed** from the agent
- The facilitator submits the tx and pays gas
- Most workflows cost **under $0.05 per call**
- Daily wallet cap: **200 USDC per UTC day** (server-enforced)
- Per-transfer cap: **100 USDC** (Turnkey-enforced)

---

## Agentic Wallet Setup

### Option 1: KeeperHub Agentic Wallet (Recommended)

Server-side Turnkey custody. No private key on disk. Three-tier safety hook.

```bash
# Install skill + safety hook
npx -p @keeperhub/wallet keeperhub-wallet skill install

# Provision a new wallet
npx -p @keeperhub/wallet keeperhub-wallet add
```

This creates:
- `~/.keeperhub/wallet.json` — HMAC secret (NOT a private key)
- `~/.keeperhub/safety.json` — Payment thresholds

**Default safety config:**
```json
{
  "auto_approve_max_usd": 5,
  "block_threshold_usd": 100,
  "allowlisted_contracts": [
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "0x20C000000000000000000000B9537D11c60E8b50"
  ]
}
```

| Tier | Behavior |
|------|----------|
| **auto** | ≤ $5 — signs without prompting |
| **ask** | $5–$100 — inline permission prompt |
| **block** | > $100 — denied |

### Option 2: agentcash (Testing Only)

```bash
npx agentcash add https://app.keeperhub.com
```

⚠️ **Plaintext key on disk.** Testing only. Do NOT custody real funds.

### Option 3: Coinbase Agentic Wallet Skills

```bash
npx skills add coinbase/agentic-wallet-skills
```

Requires CDP account. Good if already on Coinbase ecosystem.

---

## KeeperHub API

### Base URL & Auth

```
Base: https://app.keeperhub.com/api
Auth: Authorization: Bearer kh_your_api_key
```

Get API key: [app.keeperhub.com](https://app.keeperhub.com/) → Settings → API Keys → Organisation tab

### Key Endpoints for AgentVerse

#### Direct Execution — Transfer Funds
```bash
POST /api/execute/transfer
{
  "network": "base",
  "recipientAddress": "0x...",
  "amount": "0.05",
  "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}
```

#### Direct Execution — Call Smart Contract
```bash
POST /api/execute/contract-call
{
  "contractAddress": "0x...",
  "network": "ethereum",
  "functionName": "getAgent",
  "functionArgs": "[\"1\"]",
  "abi": "[{...}]"
}
```

#### Workflow Execution
```bash
# List workflows
GET /api/workflows

# Execute a workflow
POST /api/workflow/{workflowId}/execute
→ Returns { executionId, runId, status }

# Check status
GET /api/workflows/executions/{executionId}/status
→ Returns { status, progress { percentage, currentNodeId } }
```

### Rate Limits
- **API:** 100 req/min (authenticated)
- **Direct Execution:** 60 req/min per API key
- **x402 wallet:** 200 USDC/day aggregate

---

## MCP Server Integration

Agents can discover and call KeeperHub workflows through the MCP (Model Context Protocol) server.

### Setup
```bash
# Remote (recommended — no local install)
claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp
```

Or headless with API key:
```bash
claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp \
  --header "Authorization: Bearer kh_your_key_here"
```

### Meta-Tools (Agent Runtime)

The agent uses two meta-tools to discover and call workflows:

| Tool | Description |
|------|-------------|
| `search_workflows` | Find workflows by category, tag, or free text. Returns slug, description, inputSchema, price |
| `call_workflow` | Execute a workflow by slug. Read workflows return result; write workflows return unsigned calldata |

This keeps the agent's tool list small — it discovers available workflows at runtime instead of hardcoding them.

---

## TypeScript Implementation

### KeeperHub API Client

```typescript
// packages/backend/src/payments/keeperhub.ts

export class KeeperHubClient {
  private baseUrl = 'https://app.keeperhub.com/api';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.KH_API_KEY || '';
  }

  private async request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`KeeperHub ${res.status}: ${err.error?.message || res.statusText}`);
    }

    return res.json();
  }

  // ── Direct Execution ──────────────────────────────

  /** Transfer USDC on Base to an agent's wallet */
  async transferUSDC(recipientAddress: string, amount: string) {
    return this.request('/execute/transfer', {
      method: 'POST',
      body: JSON.stringify({
        network: 'base',
        recipientAddress,
        amount,
        tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
      }),
    });
  }

  /** Call a smart contract function */
  async callContract(params: {
    contractAddress: string;
    network: string;
    functionName: string;
    functionArgs?: string;
    abi?: string;
    value?: string;
  }) {
    return this.request('/execute/contract-call', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /** Check-and-execute: read a value, evaluate condition, optionally execute */
  async checkAndExecute(params: {
    contractAddress: string;
    network: string;
    functionName: string;
    functionArgs?: string;
    condition: { operator: string; value: string };
    action: {
      contractAddress: string;
      functionName: string;
      functionArgs?: string;
      abi?: string;
    };
  }) {
    return this.request('/execute/check-and-execute', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ── Execution Status ──────────────────────────────

  async getExecutionStatus(executionId: string) {
    return this.request(`/execute/${executionId}/status`);
  }

  // ── Workflows ─────────────────────────────────────

  async listWorkflows() {
    return this.request('/workflows');
  }

  async executeWorkflow(workflowId: string) {
    return this.request(`/workflow/${workflowId}/execute`, { method: 'POST' });
  }

  async getWorkflowExecutionStatus(executionId: string) {
    return this.request(`/workflows/executions/${executionId}/status`);
  }

  // ── Analytics ─────────────────────────────────────

  async getSpendCap() {
    return this.request('/analytics/spend-cap');
  }
}
```

### x402 Payment Handler

```typescript
// packages/backend/src/payments/x402.ts

/**
 * Handle x402 payment challenges from paid endpoints.
 * When an agent calls a paid service and gets HTTP 402,
 * the agentic wallet intercepts, signs, and retries.
 *
 * For AgentVerse, the flow is:
 * 1. Agent A completes work for Agent B
 * 2. Agent B's coordinator calls payment endpoint
 * 3. KeeperHub wallet handles the 402 challenge transparently
 * 4. USDC transfers on Base
 */
export async function handleX402Payment(
  serviceUrl: string,
  payload: any,
  options: { maxRetries?: number } = {}
): Promise<any> {
  const maxRetries = options.maxRetries || 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 402) {
      // The agentic wallet skill handles this automatically
      // when running inside Claude Code / MCP-enabled agent
      console.log('[x402] Payment required, wallet handling...');
      continue;
    }

    if (res.ok) {
      return res.json();
    }

    throw new Error(`Service error: ${res.status}`);
  }

  throw new Error('x402 payment failed after retries');
}
```

### Agent Payment Wrapper

```typescript
// packages/backend/src/payments/agent-payments.ts

import { KeeperHubClient } from './keeperhub.js';

const kh = new KeeperHubClient();

/**
 * Distribute task payment from coordinator to workers
 * Uses KeeperHub Direct Execution for USDC transfers on Base
 */
export async function distributeTaskPayment(
  taskId: string,
  workers: Array<{
    agentId: number;
    walletAddress: string;
    sharePercent: number;
  }>,
  totalBudgetUSDC: number
) {
  const results = [];

  for (const worker of workers) {
    const amount = ((totalBudgetUSDC * worker.sharePercent) / 100).toFixed(6);

    try {
      const result = await kh.transferUSDC(worker.walletAddress, amount);
      results.push({
        agentId: worker.agentId,
        amount,
        status: 'success',
        executionId: result.executionId,
      });
      console.log(`[Payment] Agent ${worker.agentId}: $${amount} USDC → ${worker.walletAddress}`);
    } catch (err) {
      results.push({
        agentId: worker.agentId,
        amount,
        status: 'failed',
        error: (err as Error).message,
      });
      console.error(`[Payment] Agent ${worker.agentId} payment failed:`, err);
    }
  }

  return results;
}
```

---

## Payment Flows in AgentVerse

### Flow 1: Task Completion Payment

```
User creates task with USDC budget
    │
    ▼
Coordinator decomposes task, assigns to workers
    │
    ▼
Workers complete subtasks
    │
    ▼
Coordinator verifies results
    │
    ▼
KeeperHub Direct Execution: USDC transfers to worker wallets
    │
    ▼
On-chain TaskManager records completion
```

### Flow 2: Agent Paying for External Services

```
Agent needs external data/compute
    │
    ▼
Agent calls paid service endpoint
    │
    ▼
Service returns HTTP 402 (payment required)
    │
    ▼
Agentic wallet signs EIP-3009 authorization
    │
    ▼
x402 facilitator settles USDC on Base
    │
    ▼
Service returns result
```

---

## Environment Variables

```env
# KeeperHub
KH_API_KEY=kh_your_organization_api_key

# Agentic Wallet (created by npx keeperhub-wallet add)
# Stored at ~/.keeperhub/wallet.json — do NOT commit
# Safety config at ~/.keeperhub/safety.json
```

---

## Key Constraints

| Constraint | Value | Source |
|-----------|-------|--------|
| Payment chain | Base (8453) only | Turnkey server-side policy |
| Payment token | USDC only | Contract allowlist |
| Max per transfer | 100 USDC | Turnkey policy |
| Max per day | 200 USDC | Server-enforced |
| Max auto-approve | $5 (configurable) | Client safety hook |
| API rate limit | 60 req/min (direct exec) | KeeperHub API |
| Wallet recovery | NOT possible if wallet.json lost | Back up the file |

---

## CLI Reference (Quick)

```bash
# Install
brew install keeperhub/tap/kh

# Auth
kh auth login

# List workflows
kh workflow list

# Run workflow and wait
kh workflow run <workflow-id> --wait

# Check run status
kh run status <run-id>

# Execute contract call
kh execute contract-call --protocol aave --action supply --args '{"amount":"1000000"}'

# List protocols
kh protocol list
```
