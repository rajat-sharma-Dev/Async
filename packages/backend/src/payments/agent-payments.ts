/**
 * Agent Payment Distribution
 * Coordinator pays workers in USDC on Base via KeeperHub
 * 📖 Ref: docs/KEEPERHUB_X402.md → "Payment Flows in AgentVerse"
 *
 * Chain separation:
 *  - Agent identity + tasks  → 0G Chain (via contracts/index.ts)
 *  - Payment settlement       → Base chain, USDC (via KeeperHub)
 *
 * Flow:
 * 1. Task completes on 0G Chain (TaskManager records result)
 * 2. This module distributes USDC to workers on Base via KeeperHub
 * 3. Each worker receives their share proportional to role/reputation
 */

import { getKeeperHub } from "./keeperhub.js";
import type { PaymentResult, PaymentDistribution, SwarmMember } from "../types/index.js";

/**
 * Distribute task payment from coordinator to workers.
 * Uses KeeperHub Direct Execution for USDC transfers on Base.
 * NOTE: totalBudgetUSDC is the off-chain agreed amount (e.g. $10 USDC),
 *       separate from the A0GI escrow held in TaskManager on 0G Chain.
 */
export async function distributeTaskPayment(
  taskId: number,
  workers: SwarmMember[],
  totalBudgetUSDC: number
): Promise<PaymentDistribution> {
  const kh = getKeeperHub();
  const payments: PaymentResult[] = [];

  console.log(`\n[Payment] Distributing $${totalBudgetUSDC} USDC for task #${taskId} (Base chain)`);
  console.log(`[Payment] ${workers.length} workers\n`);

  for (const worker of workers) {
    const amount = ((totalBudgetUSDC * worker.sharePercent) / 100).toFixed(6);

    try {
      const result = await kh.payAgent(worker.walletAddress, amount);
      const status = await kh.waitForPayment(result.executionId, 30000);

      payments.push({
        agentId: worker.agentId,
        walletAddress: worker.walletAddress,
        amount,
        status: status.status === "completed" ? "success" : "failed",
        executionId: result.executionId,
        error: status.error || undefined,
      });

      console.log(
        `  ✅ Agent #${worker.agentId}: $${amount} USDC → ${worker.walletAddress.slice(0, 10)}...`
      );
    } catch (err) {
      payments.push({
        agentId: worker.agentId,
        walletAddress: worker.walletAddress,
        amount,
        status: "failed",
        error: (err as Error).message,
      });
      console.error(
        `  ❌ Agent #${worker.agentId}: Payment failed — ${(err as Error).message}`
      );
    }
  }

  const successCount = payments.filter((p) => p.status === "success").length;
  console.log(`\n[Payment] Done: ${successCount}/${workers.length} successful`);

  return {
    taskId,
    totalBudget: totalBudgetUSDC.toString(),
    payments,
    timestamp: Date.now(),
  };
}

/**
 * Equal share distribution (coordinator gets a 10% bonus)
 */
export function calculateEqualShares(
  workers: Array<{ agentId: number; walletAddress: string }>,
  coordinatorBonus = 10
): SwarmMember[] {
  if (workers.length === 0) return [];
  const baseShare = 100 / workers.length;
  return workers.map((w, i) => ({
    agentId: w.agentId,
    walletAddress: w.walletAddress,
    role: i === 0 ? 0 : 1,
    sharePercent:
      i === 0
        ? baseShare + coordinatorBonus
        : baseShare - coordinatorBonus / (workers.length - 1),
  }));
}

/**
 * Reputation-weighted distribution — higher rep = higher share
 */
export function calculateReputationWeightedShares(
  workers: Array<{
    agentId: number;
    walletAddress: string;
    reputation: number;
    role: number;
  }>
): SwarmMember[] {
  const totalRep = workers.reduce((sum, w) => sum + w.reputation, 0);
  if (totalRep === 0) {
    return workers.map((w) => ({
      ...w,
      sharePercent: 100 / workers.length,
    }));
  }
  return workers.map((w) => ({
    agentId: w.agentId,
    walletAddress: w.walletAddress,
    role: w.role,
    sharePercent: (w.reputation / totalRep) * 100,
  }));
}
