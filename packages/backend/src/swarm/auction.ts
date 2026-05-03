import type { Agent, Bid, Swarm } from '../agents/types.js';

export function scoreBid(bid: Bid): number {
  const priceScore = 1 / Math.max(1, bid.amount);
  return bid.confidence * 0.55 + priceScore * 0.25 + (bid.role === 'coordinator' ? 0.2 : 0.1);
}

export function selectWinningBids(bids: Bid[], maxAgents = 4): Bid[] {
  const sorted = [...bids].sort((a, b) => scoreBid(b) - scoreBid(a));
  const byRole = new Map<string, Bid>();
  for (const bid of sorted) {
    if (!byRole.has(bid.role)) byRole.set(bid.role, bid);
  }
  const roleOrder = ['coordinator', 'researcher', 'developer', 'critic', 'trader'];
  return roleOrder
    .map((role) => byRole.get(role))
    .filter((bid): bid is Bid => Boolean(bid))
    .slice(0, maxAgents);
}

export function electCoordinator(bids: Bid[]): string {
  const coordinator = bids
    .filter((bid) => bid.role === 'coordinator')
    .sort((a, b) => b.confidence - a.confidence)[0];
  return (coordinator || [...bids].sort((a, b) => b.confidence - a.confidence)[0]).agentId;
}

export function createSwarm(taskId: string, bids: Bid[], agents: Agent[]): Swarm {
  const winners = selectWinningBids(bids);
  const coordinatorAgentId = electCoordinator(winners);
  return {
    id: `swarm-${taskId}`,
    taskId,
    coordinatorAgentId,
    memberAgentIds: winners.map((bid) => bid.agentId).filter((id) => agents.some((agent) => agent.id === id)),
    status: 'active',
    createdAt: Date.now(),
  };
}
