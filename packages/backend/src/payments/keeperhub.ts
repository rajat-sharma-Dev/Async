/**
 * KeeperHub API Client
 * PAYMENT LAYER ONLY — Base USDC transfers + MCP workflow discovery
 * 📖 Ref: docs/KEEPERHUB_X402.md, docs/tracks-docs/KeepersHub-completedocs.md
 *
 * ⚠️  IMPORTANT ARCHITECTURE NOTE:
 *     KeeperHub DOES NOT support 0G Chain (16602).
 *     KeeperHub is used ONLY for:
 *       1. x402 USDC payments on Base (chain 8453) between agents
 *       2. MCP workflow discovery at runtime
 *       3. Execution reliability / audit trail for Base transactions
 *
 *     All 0G Chain interactions (AgentNFT, TaskManager, Auction)
 *     go through our own ethers.js client → src/contracts/index.ts
 *
 * Base URL: https://app.keeperhub.com/api
 * Auth:     Bearer kh_... (org-scoped API key)
 * Rate:     60 req/min (direct exec), 100 req/min (API)
 */

const BASE_URL = "https://app.keeperhub.com/api";

// Base chain USDC — the only token KeeperHub handles for AgentVerse payments
export const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const BASE_CHAIN_ID = 8453;

export class KeeperHubClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.KH_API_KEY || "";
    if (!this.apiKey) {
      console.warn("[KeeperHub] No API key set. Payment operations will fail.");
    }
  }

  // ── Core Request ──────────────────────────────

  private async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      const msg = body.error?.message || body.error || res.statusText;
      throw new KeeperHubError(
        `KeeperHub ${res.status}: ${msg}`,
        res.status,
        body.error?.code
      );
    }

    return res.json();
  }

  // ══════════════════════════════════════════════
  // Agent Payments — USDC on Base (chain 8453)
  // ══════════════════════════════════════════════

  /**
   * Transfer USDC on Base to a worker agent's wallet.
   *
   * This is the ONLY on-chain action KeeperHub performs for AgentVerse.
   * Agent pays USDC only — KeeperHub handles gas (facilitator model).
   *
   * Limits:
   *  - Per-transfer cap: 100 USDC (Turnkey-enforced)
   *  - Daily cap:        200 USDC (server-enforced)
   *  - Safety auto-approve: ≤$5, ask: ≤$100, block: >$100
   */
  async payAgent(params: {
    agentWallet: string;
    amount: number;
    asset?: string;
    taskId?: string;
    description?: string;
  }): Promise<DirectExecutionResult> {
    const amountStr = params.amount.toFixed(6);
    console.log(
      `[KeeperHub] Paying agent $${amountStr} USDC → ${params.agentWallet}${params.taskId ? ` (task: ${params.taskId})` : ''}`
    );
    return this.request('/execute/transfer', {
      method: 'POST',
      body: JSON.stringify({
        network: 'base',
        recipientAddress: params.agentWallet,
        amount: amountStr,
        tokenAddress: BASE_USDC_ADDRESS,
        metadata: {
          taskId: params.taskId,
          description: params.description || 'AgentVerse task payment',
        },
      }),
    });
  }

  /**
   * Poll execution until completed or failed
   */
  async waitForPayment(
    executionId: string,
    timeoutMs = 60000,
    pollMs = 2000
  ): Promise<ExecutionStatus> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const status = await this.getExecutionStatus(executionId);
      if (status.status === "completed" || status.status === "failed") {
        return status;
      }
      await new Promise((r) => setTimeout(r, pollMs));
    }
    throw new KeeperHubError("Payment timed out", 408, "TIMEOUT");
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    return this.request(`/execute/${executionId}/status`);
  }

  // ══════════════════════════════════════════════
  // MCP — Workflow Discovery at Runtime
  // ══════════════════════════════════════════════

  /**
   * List workflows available to this org.
   * Agents use this to discover automatable actions at runtime.
   */
  async listWorkflows(): Promise<any[]> {
    return this.request("/workflows");
  }

  /**
   * Execute a KeeperHub workflow by ID.
   * Used by agents to trigger automations (e.g. monitoring, notifications).
   */
  async executeWorkflow(workflowId: string): Promise<WorkflowExecution> {
    return this.request(`/workflow/${workflowId}/execute`, { method: "POST" });
  }

  async getWorkflowStatus(executionId: string): Promise<WorkflowExecutionStatus> {
    return this.request(`/workflows/executions/${executionId}/status`);
  }

  async getWorkflowLogs(executionId: string): Promise<any> {
    return this.request(`/workflows/executions/${executionId}/logs`);
  }

  // ══════════════════════════════════════════════
  // Spend / Analytics
  // ══════════════════════════════════════════════

  async getSpendCap(): Promise<SpendCap> {
    return this.request("/analytics/spend-cap");
  }

  async getAnalyticsSummary(range = "7d"): Promise<any> {
    return this.request(`/analytics/summary?range=${range}`);
  }
}

// ══════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════

export interface DirectExecutionResult {
  executionId: string;
  status: "completed" | "failed";
}

export interface ExecutionStatus {
  executionId: string;
  status: "pending" | "running" | "completed" | "failed";
  transactionHash?: string;
  transactionLink?: string;
  gasUsedWei?: string;
  error?: string | null;
  createdAt?: string;
  completedAt?: string;
}

export interface WorkflowExecution {
  executionId: string;
  runId: string;
  status: "pending";
}

export interface WorkflowExecutionStatus {
  status: "pending" | "running" | "success" | "error" | "cancelled";
  progress?: {
    totalSteps: number;
    completedSteps: number;
    percentage: number;
  };
}

export interface SpendCap {
  dailyCapWei: string;
  spentTodayWei: string;
  remainingWei: string;
  percentUsed: number;
}

export class KeeperHubError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "KeeperHubError";
  }
}

// ── Singleton ───────────────────────────────────
let _client: KeeperHubClient;
export function getKeeperHub(): KeeperHubClient {
  if (!_client) _client = new KeeperHubClient();
  return _client;
}
