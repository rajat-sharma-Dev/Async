/**
 * AgentVerse — Shared Type Definitions
 * Used by both frontend and backend
 * 📖 Ref: docs/INTERFACES.md
 */

// ══════════════════════════════════════════════
// Agent Types
// ══════════════════════════════════════════════

export enum AgentRole {
  Coordinator = 0,
  Developer = 1,
  Researcher = 2,
  Critic = 3,
  Trader = 4,
}

export const ROLE_NAMES: Record<AgentRole, string> = {
  [AgentRole.Coordinator]: "Coordinator",
  [AgentRole.Developer]: "Developer",
  [AgentRole.Researcher]: "Researcher",
  [AgentRole.Critic]: "Critic",
  [AgentRole.Trader]: "Trader",
};

export interface PersonalityVector {
  riskTolerance: number;   // 0-100
  creativity: number;      // 0-100
  costSensitivity: number; // 0-100
  speed: number;           // 0-100
  quality: number;         // 0-100
}

export interface Agent {
  tokenId: number;
  name: string;
  role: AgentRole;
  metadataURI: string;
  reputation: number;
  totalEarnings: bigint;
  isActive: boolean;
  owner: string;
  personality?: PersonalityVector;
}

// ══════════════════════════════════════════════
// Task Types
// ══════════════════════════════════════════════

export enum TaskStatus {
  Open = 0,
  InProgress = 1,
  Completed = 2,
  Failed = 3,
  Cancelled = 4,
}

export const STATUS_NAMES: Record<TaskStatus, string> = {
  [TaskStatus.Open]: "Open",
  [TaskStatus.InProgress]: "In Progress",
  [TaskStatus.Completed]: "Completed",
  [TaskStatus.Failed]: "Failed",
  [TaskStatus.Cancelled]: "Cancelled",
};

export interface Task {
  id: number;
  description: string;
  creator: string;
  budget: bigint;
  status: TaskStatus;
  coordinator: string;
  resultHash: string;
  createdAt: number;
}

export interface Bid {
  agentId: number;
  bidder: string;
  amount: bigint;
  proposal: string;
}

export interface SwarmMember {
  agentId: number;
  walletAddress: string;
  role: AgentRole;
  sharePercent: number;
}

// ══════════════════════════════════════════════
// Auction Types
// ══════════════════════════════════════════════

export interface Auction {
  id: string;
  taskId: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  winners: number[];
}

export interface AuctionBid {
  agentId: number;
  bidder: string;
  score: number;
}

// ══════════════════════════════════════════════
// AXL P2P Message Types
// ══════════════════════════════════════════════

export enum MessageType {
  TASK_BROADCAST = "TASK_BROADCAST",
  BID = "BID",
  BID_ACCEPTED = "BID_ACCEPTED",
  BID_REJECTED = "BID_REJECTED",
  SWARM_INVITE = "SWARM_INVITE",
  SWARM_ACCEPT = "SWARM_ACCEPT",
  DELEGATION = "DELEGATION",
  RESULT = "RESULT",
  REVIEW = "REVIEW",
  PAYMENT_NOTICE = "PAYMENT_NOTICE",
  HEARTBEAT = "HEARTBEAT",
  AGENT_PROMPT = "AGENT_PROMPT",
}

export interface AXLMessage {
  type: MessageType;
  from: number;        // sender agentId
  to: number;          // recipient agentId (0 = broadcast)
  taskId?: number;
  payload: any;
  timestamp: number;
}

// ══════════════════════════════════════════════
// Payment Types
// ══════════════════════════════════════════════

export interface PaymentResult {
  agentId: number;
  walletAddress: string;
  amount: string;         // USDC amount
  status: 'success' | 'failed' | 'pending';
  executionId?: string;
  transactionHash?: string;  // Base USDC tx hash (from KeeperHub) or 0G tx hash
  error?: string;
}


export interface PaymentDistribution {
  taskId: number;
  totalBudget: string;    // USDC
  payments: PaymentResult[];
  timestamp: number;
}

// ══════════════════════════════════════════════
// API Request/Response Types
// ══════════════════════════════════════════════

export interface CreateTaskRequest {
  description: string;
  budget: string;         // in wei
}

export interface MintAgentRequest {
  name: string;
  role: AgentRole;
  metadataURI: string;
}

export interface SubmitBidRequest {
  taskId: number;
  agentId: number;
  amount: string;         // in wei
  proposal: string;
}

// ══════════════════════════════════════════════
// Contract Addresses (0G Testnet)
// ══════════════════════════════════════════════

export const CONTRACT_ADDRESSES = {
  AgentNFT: "0xD940B3Dec08366D4f4977eFbb2281B146aee5F69",
  TaskManager: "0xd1A98cA6db8E122e2Bd23aD0915d654b3BeB27b1",
  Auction: "0xd1519f4495D3b3E79f2F9877e6FfcEc9b1bA3057",
} as const;

export const CHAIN_CONFIG = {
  chainId: 16602,
  rpcUrl: "https://evmrpc-testnet.0g.ai",
  explorer: "https://chainscan-galileo.0g.ai",
  name: "0G Testnet",
} as const;
