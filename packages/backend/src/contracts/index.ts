/**
 * Contract Interaction Utilities — 0G Chain
 * ethers.js wrappers for AgentNFT, TaskManager, Auction
 * 📖 Ref: docs/SMART_CONTRACTS.md
 *
 * All interactions are with 0G Testnet (Chain 16602).
 * KeeperHub does NOT support 0G Chain — use this file for all on-chain calls.
 */

import { JsonRpcProvider, Wallet, Contract, formatEther, parseEther } from "ethers";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import {
  CONTRACT_ADDRESSES,
  CHAIN_CONFIG,
  type Agent,
  type Task,
  type Bid,
  AgentRole,
  TaskStatus,
} from "../types/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../.env") });

// ── ABI Loading ───────────────────────────────────
const loadABI = (name: string) =>
  JSON.parse(readFileSync(resolve(__dirname, `${name}.abi.json`), "utf-8"));

const AgentNFT_ABI = loadABI("AgentNFT");
const TaskManager_ABI = loadABI("TaskManager");
const Auction_ABI = loadABI("Auction");

// ── Provider + Signer ─────────────────────────────
let _provider: JsonRpcProvider;
let _signer: Wallet;

export function getProvider(): JsonRpcProvider {
  if (!_provider) {
    _provider = new JsonRpcProvider(
      process.env.OG_RPC_URL || CHAIN_CONFIG.rpcUrl,
      { chainId: CHAIN_CONFIG.chainId, name: CHAIN_CONFIG.name }
    );
  }
  return _provider;
}

export function getSigner(): Wallet {
  if (!_signer) {
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error("PRIVATE_KEY not set in .env");
    const key = pk.startsWith("0x") ? pk : `0x${pk}`;
    _signer = new Wallet(key, getProvider());
  }
  return _signer;
}

// ── Contract Instances ────────────────────────────

function getAgentNFT(signerOrProvider?: any): Contract {
  return new Contract(
    process.env.AGENT_NFT_ADDRESS || CONTRACT_ADDRESSES.AgentNFT,
    AgentNFT_ABI,
    signerOrProvider || getSigner()
  );
}

function getTaskManager(signerOrProvider?: any): Contract {
  return new Contract(
    process.env.TASK_MANAGER_ADDRESS || CONTRACT_ADDRESSES.TaskManager,
    TaskManager_ABI,
    signerOrProvider || getSigner()
  );
}

function getAuction(signerOrProvider?: any): Contract {
  return new Contract(
    process.env.AUCTION_ADDRESS || CONTRACT_ADDRESSES.Auction,
    Auction_ABI,
    signerOrProvider || getSigner()
  );
}

// ══════════════════════════════════════════════════
// AgentNFT
// ══════════════════════════════════════════════════

export async function mintAgent(
  to: string, name: string, role: AgentRole, metadataURI: string
): Promise<{ tokenId: number; txHash: string }> {
  const nft = getAgentNFT();
  const tx = await nft.mintAgent(to, name, role, metadataURI);
  const receipt = await tx.wait();
  const event = receipt.logs.find((l: any) => l.fragment?.name === "AgentRegistered");
  const tokenId = event ? Number(event.args[0]) : -1;
  console.log(`[AgentNFT] Minted #${tokenId} "${name}" → ${to}`);
  return { tokenId, txHash: receipt.hash };
}

export async function getAgent(tokenId: number): Promise<Agent> {
  const nft = getAgentNFT(getProvider());
  const data = await nft.getAgent(tokenId);
  const owner = await nft.ownerOf(tokenId);
  return {
    tokenId,
    name: data.name,
    role: Number(data.role) as AgentRole,
    metadataURI: data.metadataURI,
    reputation: Number(data.reputation),
    totalEarnings: data.totalEarnings,
    isActive: data.isActive,
    owner,
  };
}

export async function getAgentsByOwner(owner: string): Promise<Agent[]> {
  const nft = getAgentNFT(getProvider());
  const tokenIds: bigint[] = await nft.getAgentsByOwner(owner);
  return Promise.all(tokenIds.map((id) => getAgent(Number(id))));
}

export async function updateReputation(tokenId: number, reputation: number): Promise<string> {
  const nft = getAgentNFT();
  const tx = await nft.updateReputation(tokenId, reputation);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function recordEarnings(tokenId: number, amount: bigint): Promise<string> {
  const nft = getAgentNFT();
  const tx = await nft.recordEarnings(tokenId, amount);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function totalAgents(): Promise<number> {
  return Number(await getAgentNFT(getProvider()).totalAgents());
}

// ══════════════════════════════════════════════════
// TaskManager
// ══════════════════════════════════════════════════

export async function createTask(
  description: string, budgetWei: bigint
): Promise<{ taskId: number; txHash: string }> {
  const tm = getTaskManager();
  const tx = await tm.createTask(description, { value: budgetWei });
  const receipt = await tx.wait();
  const event = receipt.logs.find((l: any) => l.fragment?.name === "TaskCreated");
  const taskId = event ? Number(event.args[0]) : -1;
  console.log(`[TaskManager] Task #${taskId} created, budget: ${formatEther(budgetWei)} A0GI`);
  return { taskId, txHash: receipt.hash };
}

export async function getTask(taskId: number): Promise<Task> {
  const tm = getTaskManager(getProvider());
  const data = await tm.getTask(taskId);
  return {
    id: taskId,
    description: data.description,
    creator: data.creator,
    budget: data.budget,
    status: Number(data.status) as TaskStatus,
    coordinator: data.coordinator,
    resultHash: data.resultHash,
    createdAt: Number(data.createdAt),
  };
}

export async function submitBid(
  taskId: number, agentId: number, amount: bigint, proposal: string
): Promise<string> {
  const tx = await getTaskManager().submitBid(taskId, agentId, amount, proposal);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function getBids(taskId: number): Promise<Bid[]> {
  const bids = await getTaskManager(getProvider()).getBids(taskId);
  return bids.map((b: any) => ({
    agentId: Number(b.agentId),
    bidder: b.bidder,
    amount: b.amount,
    proposal: b.proposal,
  }));
}

export async function formSwarm(
  taskId: number, coordinatorId: number, memberIds: number[]
): Promise<string> {
  const tx = await getTaskManager().formSwarm(taskId, coordinatorId, memberIds);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function submitResult(taskId: number, resultHash: string): Promise<string> {
  const tx = await getTaskManager().submitResult(taskId, resultHash);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function distributePayment(
  taskId: number, recipients: string[], amounts: bigint[]
): Promise<string> {
  const tx = await getTaskManager().distributePayment(taskId, recipients, amounts);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function failTask(taskId: number): Promise<string> {
  const tx = await getTaskManager().failTask(taskId);
  const receipt = await tx.wait();
  return receipt.hash;
}

// ══════════════════════════════════════════════════
// Auction
// ══════════════════════════════════════════════════

export async function startAuction(taskId: number, durationSecs: number): Promise<string> {
  const tx = await getAuction().startAuction(taskId, durationSecs);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function placeAuctionBid(
  taskId: number, agentId: number, score: number
): Promise<string> {
  const tx = await getAuction().placeBid(taskId, agentId, score);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function finalizeAuction(taskId: number, winnerIds: number[]): Promise<string> {
  const tx = await getAuction().finalizeAuction(taskId, winnerIds);
  const receipt = await tx.wait();
  return receipt.hash;
}

// ── Utility ───────────────────────────────────────

export async function getDeployerBalance(): Promise<string> {
  const balance = await getProvider().getBalance(getSigner().address);
  return formatEther(balance);
}
