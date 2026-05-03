import { Wallet } from 'ethers';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { Agent, AgentRole, BidDecision, PersonalityVector, Task } from './types.js';

// Load .env so PRIVATE_KEY is available when createDefaultAgents() is called at init
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../.env') });

const ROLE_PROMPTS: Record<AgentRole, string> = {
  coordinator:
    'You are a project manager agent. Break tasks into subtasks, assign specialists, track progress, and enforce quality.',
  developer:
    'You are a senior developer agent. Produce clean implementation plans, code-oriented outputs, and practical technical decisions.',
  researcher:
    'You are a research analyst agent. Gather context, verify assumptions, and synthesize findings into useful direction.',
  critic:
    'You are a quality reviewer agent. Find risks, test gaps, weak reasoning, and concrete fixes.',
  trader:
    'You are an economic strategist agent. Evaluate budgets, bids, incentives, and payment efficiency.',
};

export const DEFAULT_PERSONALITIES: Record<AgentRole, PersonalityVector> = {
  coordinator: {
    riskTolerance: 0.35,
    creativity: 0.55,
    costSensitivity: 0.45,
    thoroughness: 0.9,
    independence: 0.35,
  },
  developer: {
    riskTolerance: 0.65,
    creativity: 0.85,
    costSensitivity: 0.35,
    thoroughness: 0.68,
    independence: 0.55,
  },
  researcher: {
    riskTolerance: 0.45,
    creativity: 0.62,
    costSensitivity: 0.4,
    thoroughness: 0.88,
    independence: 0.78,
  },
  critic: {
    riskTolerance: 0.18,
    creativity: 0.35,
    costSensitivity: 0.5,
    thoroughness: 0.95,
    independence: 0.6,
  },
  trader: {
    riskTolerance: 0.48,
    creativity: 0.45,
    costSensitivity: 0.92,
    thoroughness: 0.72,
    independence: 0.7,
  },
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0.5));
}

export function normalizePersonality(personality: Partial<PersonalityVector>, role: AgentRole): PersonalityVector {
  const defaults = DEFAULT_PERSONALITIES[role];
  return {
    riskTolerance: clamp01(personality.riskTolerance ?? defaults.riskTolerance),
    creativity: clamp01(personality.creativity ?? defaults.creativity),
    costSensitivity: clamp01(personality.costSensitivity ?? defaults.costSensitivity),
    thoroughness: clamp01(personality.thoroughness ?? defaults.thoroughness),
    independence: clamp01(personality.independence ?? defaults.independence),
  };
}

function describeLevel(value: number): string {
  if (value >= 0.75) return 'high';
  if (value >= 0.4) return 'moderate';
  return 'low';
}

export function buildSystemPrompt(agent: Agent, memory: unknown): string {
  const traits = agent.personality;
  return `${ROLE_PROMPTS[agent.role]}

Your behavioral traits:
- Risk tolerance: ${describeLevel(traits.riskTolerance)} (${traits.riskTolerance})
- Creativity: ${describeLevel(traits.creativity)} (${traits.creativity})
- Cost sensitivity: ${describeLevel(traits.costSensitivity)} (${traits.costSensitivity})
- Thoroughness: ${describeLevel(traits.thoroughness)} (${traits.thoroughness})
- Independence: ${describeLevel(traits.independence)} (${traits.independence})

Recent persistent memory:
${JSON.stringify(memory, null, 2)}

Respond as the agent. Be concise, specific, and action-oriented.`;
}

export function evaluateRoleMatch(role: AgentRole, text: string): number {
  const body = text.toLowerCase();
  const roleTerms: Record<AgentRole, string[]> = {
    coordinator: ['plan', 'coordinate', 'manage', 'decompose', 'assign', 'swarm', 'workflow'],
    developer: ['build', 'code', 'app', 'frontend', 'backend', 'contract', 'implement', 'debug'],
    researcher: ['research', 'verify', 'analyze', 'market', 'facts', 'summarize', 'compare'],
    critic: ['review', 'test', 'quality', 'risk', 'audit', 'validate', 'fix'],
    trader: ['budget', 'pay', 'price', 'bid', 'cost', 'auction', 'economy', 'token'],
  };
  const hits = roleTerms[role].filter((term) => body.includes(term)).length;
  const base = role === 'coordinator' ? 0.55 : 0.35;
  return clamp01(base + hits * 0.13);
}

export function shouldBidOnTask(agent: Agent, task: Task): BidDecision {
  const roleMatch = evaluateRoleMatch(agent.role, task.description);
  const economicValue = clamp01(task.budget / 10) * (1 - agent.personality.costSensitivity * 0.35);
  const confidence = clamp01(roleMatch * 0.55 + agent.personality.thoroughness * 0.25 + agent.personality.riskTolerance * 0.2);
  const threshold = 0.38 + agent.personality.costSensitivity * 0.16 - agent.personality.riskTolerance * 0.12;
  const bidAmount = Number(
    Math.max(0.1, task.budget * (0.12 + roleMatch * 0.18) * (1 + (1 - agent.personality.costSensitivity) * 0.35)).toFixed(2),
  );

  return {
    shouldBid: confidence + economicValue * 0.15 >= threshold,
    bidAmount,
    confidence: Number(confidence.toFixed(2)),
    proposal: `${agent.name} will handle the ${agent.role} angle with ${describeLevel(agent.personality.thoroughness)} thoroughness and ${describeLevel(agent.personality.creativity)} creativity.`,
  };
}

export function createDefaultAgents(): Array<Omit<Agent, 'id' | 'createdAt'>> {
  // Derive real Ethereum wallet addresses deterministically from the deployer private key.
  // Each agent index gets a unique address via byte-rotation of the private key.
  // These are real secp256k1 keypairs — valid on Base for USDC receipt.
  function deriveAgentWallet(index: number): string {
    const pk = process.env.PRIVATE_KEY;
    if (!pk) return `0x${'0'.repeat(40)}`;
    const raw = pk.replace('0x', '');
    if (raw.length !== 64) return `0x${'0'.repeat(40)}`;
    if (index === 0) return new Wallet(`0x${raw}`).address;

    const pkBytes = Buffer.from(raw, 'hex');
    const derived = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) {
      derived[i] = (pkBytes[i] ^ (index * 37 + i * 7)) & 0xff;
    }
    // Clamp first byte to ensure valid secp256k1 private key (must be in [1, n-1])
    derived[0] = Math.max(1, derived[0] & 0x7f);
    return new Wallet('0x' + derived.toString('hex')).address;
  }

  const AGENT_WALLETS = [0, 1, 2, 3, 4].map(deriveAgentWallet);
  console.log('[Agents] Derived wallet addresses:');
  AGENT_WALLETS.forEach((addr, i) => console.log(`  [${i}] ${addr}`));

  const seeds: Array<{ name: string; role: AgentRole; personality: PersonalityVector }> = [
    { name: 'Architect',   role: 'coordinator', personality: DEFAULT_PERSONALITIES.coordinator },
    { name: 'NovaCoder',   role: 'developer',   personality: DEFAULT_PERSONALITIES.developer },
    { name: 'InfoHound',   role: 'researcher',  personality: DEFAULT_PERSONALITIES.researcher },
    { name: 'QualityGate', role: 'critic',      personality: DEFAULT_PERSONALITIES.critic },
    { name: 'PennyWise',   role: 'trader',      personality: DEFAULT_PERSONALITIES.trader },
  ];

  return seeds.map((agent, index) => ({
    ...agent,
    walletAddress: AGENT_WALLETS[index],
    axlPeerId: `local-peer-${index + 1}`,
    axlNodeId: index % 2 === 0 ? 'node-a' : 'node-b',
    memoryKey: `agent:${agent.name.toLowerCase()}:memory`,
    metadataUri: `0g://metadata/agent-${index + 1}`,
    isActive: true,
  }));
}

