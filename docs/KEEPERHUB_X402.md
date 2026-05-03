# 💰 KEEPERHUB_X402.md — Payment Flows & Execution

## Overview

AgentVerse uses the **x402 protocol** for agent-to-agent micropayments and **KeeperHub** for reliable on-chain execution. This enables agents to pay each other for completed subtasks without human intervention.

---

## x402 Protocol

### How It Works

x402 uses the HTTP `402 Payment Required` status code to embed payments into standard HTTP requests:

```
Agent A (payer)          Service/Agent B (payee)         KeeperHub (facilitator)
     │                         │                              │
     ├─ HTTP Request ─────────►│                              │
     │◄─ 402 + Payment Terms ─┤                              │
     │                         │                              │
     ├─ Sign payment ─────────►│                              │
     │  (X-PAYMENT header)     │                              │
     │                         ├─ Verify payment ────────────►│
     │                         │◄─ Settlement confirmed ──────┤
     │◄─ 200 + Response ──────┤                              │
```

### Integration in AgentVerse

Each agent has a wallet. When an agent completes work for another agent, the payment flow is:

1. Worker agent submits result to coordinator
2. Coordinator's x402 client receives `402 Payment Required`
3. Client signs payment authorization with coordinator's wallet
4. KeeperHub verifies and settles on Base (USDC)
5. Worker receives payment

### TypeScript Implementation

```typescript
// packages/backend/src/payments/x402.ts

import { ethers } from 'ethers';

export class X402Client {
  private wallet: ethers.Wallet;

  constructor(privateKey: string) {
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    this.wallet = new ethers.Wallet(privateKey, provider);
  }

  // Wrap fetch to handle 402 challenges automatically
  async payableFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, options);

    if (response.status === 402) {
      const paymentTerms = response.headers.get('PAYMENT-REQUIRED');
      if (!paymentTerms) throw new Error('402 without payment terms');

      const terms = JSON.parse(paymentTerms);
      const paymentAuth = await this.signPayment(terms);

      // Retry with payment header
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-PAYMENT': JSON.stringify(paymentAuth)
        }
      });
    }

    return response;
  }

  private async signPayment(terms: PaymentTerms): Promise<PaymentAuth> {
    const message = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'address', 'uint256'],
      [terms.recipient, terms.amount, terms.asset, terms.nonce]
    );
    const signature = await this.wallet.signMessage(ethers.getBytes(message));

    return {
      signature,
      payer: this.wallet.address,
      amount: terms.amount,
      asset: terms.asset,
      nonce: terms.nonce
    };
  }
}

interface PaymentTerms {
  recipient: string;
  amount: string;
  asset: string;      // USDC contract address
  network: string;    // 'base'
  nonce: string;
}

interface PaymentAuth {
  signature: string;
  payer: string;
  amount: string;
  asset: string;
  nonce: string;
}
```

### Agent Payment Wrapper

```typescript
// packages/backend/src/payments/agent-payments.ts

export class AgentPaymentService {
  private x402: X402Client;
  private keeperHub: KeeperHubClient;

  constructor(agentWalletKey: string) {
    this.x402 = new X402Client(agentWalletKey);
    this.keeperHub = new KeeperHubClient();
  }

  async payAgent(
    recipientAgentId: string,
    amount: number,
    reason: string
  ): Promise<PaymentReceipt> {
    const recipientWallet = await getAgentWallet(recipientAgentId);

    const receipt = await this.keeperHub.executePayment({
      from: this.x402.wallet.address,
      to: recipientWallet,
      amount: ethers.parseUnits(amount.toString(), 6), // USDC 6 decimals
      asset: USDC_BASE_ADDRESS,
      memo: reason
    });

    return receipt;
  }

  async payForSubtask(
    subtask: Subtask,
    workerAgentId: string
  ): Promise<PaymentReceipt> {
    return this.payAgent(
      workerAgentId,
      subtask.estimatedCost,
      `Payment for subtask: ${subtask.title}`
    );
  }
}
```

---

## KeeperHub Integration

### What KeeperHub Provides

| Feature | Benefit for AgentVerse |
|---------|----------------------|
| **Reliable execution** | Payments guaranteed to settle |
| **Retry logic** | Failed txns automatically retried |
| **Gas optimization** | Batched transactions, optimal gas |
| **x402 facilitator** | Verifies payments, manages settlement |
| **Workflow engine** | Complex multi-step payment flows |

### KeeperHub Client

```typescript
// packages/backend/src/payments/keeper.ts

export class KeeperHubClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.KEEPER_HUB_API || 'https://api.keeperhub.com';
    this.apiKey = process.env.KEEPER_HUB_API_KEY || '';
  }

  async executePayment(params: {
    from: string;
    to: string;
    amount: bigint;
    asset: string;
    memo: string;
  }): Promise<PaymentReceipt> {
    const response = await fetch(`${this.apiUrl}/v1/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        action: 'transfer',
        params: {
          from: params.from,
          to: params.to,
          amount: params.amount.toString(),
          asset: params.asset,
          network: 'base',
          memo: params.memo
        },
        options: {
          retries: 3,
          gasOptimization: true
        }
      })
    });

    return response.json();
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus> {
    const response = await fetch(`${this.apiUrl}/v1/workflows/${workflowId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.json();
  }
}
```

---

## Payment Flows in AgentVerse

### Flow 1: Task Completion Payment

```
User submits task with budget (e.g., 5 USDC)
  │
  ▼
Task budget locked in TaskManager contract (0G Chain)
  │
  ▼
Swarm completes task
  │
  ▼
Coordinator distributes payments to workers:
  ├─ Developer: 2.0 USDC (via x402/KeeperHub)
  ├─ Researcher: 1.0 USDC (via x402/KeeperHub)
  ├─ Critic: 0.5 USDC (via x402/KeeperHub)
  └─ Coordinator: 1.5 USDC (self-payment)
```

### Flow 2: Agent-to-Agent Delegation Payment

```
Coordinator delegates subtask to Developer
  │
  ▼
Developer completes subtask
  │
  ▼
Developer sends PAYMENT_REQUEST via AXL
  │
  ▼
Coordinator verifies result quality
  │
  ▼
Coordinator executes x402 payment to Developer
  │
  ▼
Coordinator sends PAYMENT_CONFIRM via AXL
```

### Flow 3: Micropayment Stream (Future)

For long-running tasks, payments can be streamed:
```
Every N minutes of active work:
  Coordinator ──► x402 micropayment ──► Worker
```

---

## Smart Contract Interaction

### Budget Locking (0G Chain)

```solidity
function createTask(string memory description, uint256 budget) external payable {
    require(msg.value >= budget, "Insufficient budget");
    tasks[taskCount] = Task({
        id: taskCount,
        requester: msg.sender,
        description: description,
        budget: budget,
        status: TaskStatus.Open,
        lockedFunds: msg.value
    });
    emit TaskCreated(taskCount, msg.sender, description, budget);
    taskCount++;
}
```

### Payment Distribution

Budget is locked on 0G Chain. Actual agent-to-agent payments flow through x402/KeeperHub on Base. The on-chain record on 0G Chain tracks who earned what.

```solidity
function recordPayment(
    uint256 taskId,
    address agent,
    uint256 amount,
    string memory subtaskId
) external onlyCoordinator(taskId) {
    emit PaymentRecorded(taskId, agent, amount, subtaskId);
}
```

---

## Track Satisfaction

### How AgentVerse uses KeeperHub + x402:

1. **x402 protocol** — Native agent-to-agent micropayments via HTTP
2. **KeeperHub execution** — Reliable payment settlement with retry logic
3. **Gas optimization** — KeeperHub batches and optimizes transactions
4. **Autonomous payments** — Agents pay each other without human intervention
5. **Auditable** — All payments logged on-chain and in 0G storage
