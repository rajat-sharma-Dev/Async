/**
 * KeeperHub API Client
 * Direct Execution + Workflow management
 * 📖 Ref: docs/KEEPERHUB_X402.md, docs/tracks-docs/KeepersHub-completedocs.md
 *
 * Base URL: https://app.keeperhub.com/api
 * Auth: Bearer kh_... (org-scoped API key)
 * Rate: 60 req/min (direct exec), 100 req/min (API)
 */

const BASE_URL = "https://app.keeperhub.com/api";
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base chain USDC

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
  // Direct Execution — Transfer Funds
  // ══════════════════════════════════════════════

  /**
   * Transfer USDC on Base to a recipient
   * Agent pays USDC only — NO gas needed (facilitator pays)
   * Per-transfer cap: 100 USDC, daily cap: 200 USDC
   */
  async transferUSDC(
    recipientAddress: string,
    amount: string
  ): Promise<DirectExecutionResult> {
    console.log(`[KeeperHub] Transferring $${amount} USDC → ${recipientAddress}`);
    return this.request("/execute/transfer", {
      method: "POST",
      body: JSON.stringify({
        network: "base",
        recipientAddress,
        amount,
        tokenAddress: BASE_USDC,
      }),
    });
  }

  /**
   * Transfer native tokens (ETH, A0GI, etc.)
   */
  async transferNative(
    network: string,
    recipientAddress: string,
    amount: string
  ): Promise<DirectExecutionResult> {
    return this.request("/execute/transfer", {
      method: "POST",
      body: JSON.stringify({ network, recipientAddress, amount }),
    });
  }

  // ══════════════════════════════════════════════
  // Direct Execution — Smart Contract Calls
  // ══════════════════════════════════════════════

  /**
   * Call any smart contract function
   * Auto-detects read vs write operations
   */
  async callContract(params: {
    contractAddress: string;
    network: string;
    functionName: string;
    functionArgs?: string;
    abi?: string;
    value?: string;
    gasLimitMultiplier?: string;
  }): Promise<any> {
    return this.request("/execute/contract-call", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Check-and-execute: read a value, evaluate condition, optionally execute
   */
  async checkAndExecute(params: {
    contractAddress: string;
    network: string;
    functionName: string;
    functionArgs?: string;
    condition: { operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte"; value: string };
    action: {
      contractAddress: string;
      functionName: string;
      functionArgs?: string;
      abi?: string;
    };
  }): Promise<CheckAndExecuteResult> {
    return this.request("/execute/check-and-execute", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // ══════════════════════════════════════════════
  // Execution Status
  // ══════════════════════════════════════════════

  async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    return this.request(`/execute/${executionId}/status`);
  }

  /**
   * Poll execution until completion
   */
  async waitForExecution(
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
    throw new KeeperHubError("Execution timed out", 408, "TIMEOUT");
  }

  // ══════════════════════════════════════════════
  // Workflows
  // ══════════════════════════════════════════════

  async listWorkflows(): Promise<any[]> {
    return this.request("/workflows");
  }

  async getWorkflow(workflowId: string): Promise<any> {
    return this.request(`/workflows/${workflowId}`);
  }

  async executeWorkflow(workflowId: string): Promise<WorkflowExecution> {
    return this.request(`/workflow/${workflowId}/execute`, { method: "POST" });
  }

  async getWorkflowExecutionStatus(
    executionId: string
  ): Promise<WorkflowExecutionStatus> {
    return this.request(`/workflows/executions/${executionId}/status`);
  }

  async getWorkflowExecutionLogs(executionId: string): Promise<any> {
    return this.request(`/workflows/executions/${executionId}/logs`);
  }

  // ══════════════════════════════════════════════
  // Analytics
  // ══════════════════════════════════════════════

  async getSpendCap(): Promise<SpendCap> {
    return this.request("/analytics/spend-cap");
  }

  async getAnalyticsSummary(range = "30d"): Promise<any> {
    return this.request(`/analytics/summary?range=${range}`);
  }

  // ══════════════════════════════════════════════
  // Integrations
  // ══════════════════════════════════════════════

  async listIntegrations(type?: string): Promise<any[]> {
    const query = type ? `?type=${type}` : "";
    return this.request(`/integrations${query}`);
  }

  async getWalletIntegration(): Promise<any> {
    const integrations = await this.listIntegrations("web3");
    return integrations[0]; // First web3 integration
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
  type?: string;
  transactionHash?: string;
  transactionLink?: string;
  gasUsedWei?: string;
  result?: any;
  error?: string | null;
  createdAt?: string;
  completedAt?: string;
}

export interface CheckAndExecuteResult {
  executed: boolean;
  executionId?: string;
  status?: string;
  condition: {
    met: boolean;
    observedValue: string;
    targetValue: string;
    operator: string;
  };
}

export interface WorkflowExecution {
  executionId: string;
  runId: string;
  status: "pending";
}

export interface WorkflowExecutionStatus {
  status: "pending" | "running" | "success" | "error" | "cancelled";
  nodeStatuses?: Array<{ nodeId: string; status: string }>;
  progress?: {
    totalSteps: number;
    completedSteps: number;
    runningSteps: number;
    currentNodeId: string;
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
  if (!_client) {
    _client = new KeeperHubClient();
  }
  return _client;
}
