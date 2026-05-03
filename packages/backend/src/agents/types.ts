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
  memoryKey: string;
  metadataUri: string;
  isActive: boolean;
  createdAt: number;
}

export interface AgentInstance {
  agent: Agent;
  isActive: boolean;
  currentTask: string | null;
  currentSwarm: string | null;
}

export type TaskStatus = 'open' | 'bidding' | 'in_progress' | 'review' | 'completed' | 'failed';
export type SubtaskStatus = 'pending' | 'in_progress' | 'review' | 'complete' | 'failed';

export interface Task {
  id: string;
  description: string;
  requester: string;
  budget: number;
  status: TaskStatus;
  coordinatorAgentId: string;
  subtasks: Subtask[];
  swarmId: string;
  resultHash: string;
  finalResult: string;
  createdAt: number;
  completedAt: number;
}

export interface Subtask {
  id: string;
  title: string;
  description: string;
  assignedRole: AgentRole;
  assignedAgentId: string;
  dependencies: string[];
  estimatedCost: number;
  status: SubtaskStatus;
  result: string;
  attempts: number;
}

export interface Bid {
  agentId: string;
  taskId: string;
  amount: number;
  confidence: number;
  role: AgentRole;
  proposal: string;
  timestamp: number;
}

export interface BidDecision {
  shouldBid: boolean;
  bidAmount: number;
  confidence: number;
  proposal: string;
}

export interface Swarm {
  id: string;
  taskId: string;
  coordinatorAgentId: string;
  memberAgentIds: string[];
  status: 'forming' | 'active' | 'completed' | 'disbanded';
  createdAt: number;
}

export type MessageType =
  | 'TASK_BROADCAST'
  | 'BID'
  | 'SWARM_INVITE'
  | 'SWARM_ACK'
  | 'DELEGATION'
  | 'PROGRESS'
  | 'RESULT'
  | 'REVIEW_REQUEST'
  | 'REVIEW_FEEDBACK'
  | 'ADAPTATION'
  | 'PAYMENT_REQUEST'
  | 'PAYMENT_CONFIRM'
  | 'HEARTBEAT';

export interface AXLMessage {
  type: MessageType;
  from: string;
  to: string;
  taskId?: string;
  swarmId?: string;
  payload: unknown;
  timestamp: number;
  nonce: string;
}

export interface PaymentReceipt {
  txHash: string;
  from: string;
  to: string;
  amount: number;
  asset: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TimelineEvent {
  id: string;
  event: string;
  data: unknown;
  timestamp: number;
}
