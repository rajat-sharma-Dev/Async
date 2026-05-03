// Shared frontend types + API client

export type AgentRole = 'coordinator' | 'developer' | 'researcher' | 'critic' | 'trader';

export interface PersonalityVector {
  riskTolerance: number;
  creativity: number;
  costSensitivity: number;
  thoroughness: number;
  independence: number;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  personality: PersonalityVector;
  walletAddress: string;
  axlPeerId: string;
  axlNodeId: string;
  metadataUri: string;
  isActive: boolean;
  createdAt: number;
}

export interface Subtask {
  id: string;
  title: string;
  assignedRole: AgentRole;
  assignedAgentId: string;
  status: string;
  result: string;
}

export interface Task {
  id: string;
  description: string;
  requester?: string;
  budget: number;
  status: string;
  coordinatorAgentId: string;
  subtasks: Subtask[];
  resultHash: string;
  finalResult: string;
  createdAt: number;
  completedAt: number;
  // On-chain fields (populated by bridge)
  onChainTaskId?: number;
  onChainTxHash?: string;
}

export interface PaymentReceipt {
  txHash: string;
  from: string;
  to: string;
  amount: number;
  asset: string;
  timestamp: number;
  status: string;
}

export interface TimelineEvent {
  id: string;
  event: string;
  data: any;
  timestamp: number;
}

export interface AgentProfile {
  agent: Agent;
  memory: unknown;
  taskHistory: unknown[];
  earnings: { total: number; history: PaymentReceipt[] };
}

export const ROLE_COLORS: Record<AgentRole, string> = {
  coordinator: '#55b6ff',
  developer:   '#7ee787',
  researcher:  '#f2cc60',
  critic:      '#ff8fab',
  trader:      '#c297ff',
};

export const ROLE_EMOJIS: Record<AgentRole, string> = {
  coordinator: '🎯',
  developer:   '⚡',
  researcher:  '🔍',
  critic:      '🛡️',
  trader:      '💎',
};

export const TRAIT_LABELS: Record<keyof PersonalityVector, string> = {
  riskTolerance:   'Risk',
  creativity:      'Creativity',
  costSensitivity: 'Cost Sense',
  thoroughness:    'Thorough',
  independence:    'Independent',
};

// ── API helpers ──────────────────────────────────────────────────────
export const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const WS  = import.meta.env.VITE_WS_URL  || 'ws://localhost:3001';

export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
