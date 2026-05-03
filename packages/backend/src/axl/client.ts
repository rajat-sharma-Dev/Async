/**
 * AXL P2P Messaging Layer
 * Real HTTP calls to AXL node REST API (ports 9002 / 9012)
 * Falls back to in-process EventEmitter bus when nodes are unreachable.
 *
 * 📖 Ref: docs/AXL_INTEGRATION.md
 *
 * AXL node REST API (each node exposes):
 *   GET  /topology     → peer info, public key
 *   POST /send         → send message to peer (header: X-Destination-Peer-Id)
 *   GET  /recv         → receive next queued message (header: X-From-Peer-Id)
 *
 * Agents are assigned to nodes (node-a port 9002, node-b port 9012).
 * Messages between agents on different nodes traverse the P2P mesh.
 */

import { EventEmitter } from "events";
import crypto from "crypto";
import type { AXLMessage } from "../agents/types.js";

// ── In-process fallback bus (used when AXL nodes are not running) ──────────
const localBus = new EventEmitter();
localBus.setMaxListeners(50);

export interface AXLReceivedMessage {
  from: string;
  data: AXLMessage;
}

// ── AXL Node Client ────────────────────────────────────────────────────────

export class AXLClient {
  private readonly baseUrl: string;
  private cachedPeerId: string | null = null;
  private reachable: boolean | null = null; // null = unknown, true/false = tested

  constructor(port: number) {
    this.baseUrl = `http://127.0.0.1:${port}`;
  }

  /** Check if the AXL node is reachable. Cached after first call. */
  async checkReachable(): Promise<boolean> {
    if (this.reachable !== null) return this.reachable;
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(`${this.baseUrl}/topology`, { signal: ctrl.signal });
      clearTimeout(timeout);
      this.reachable = res.ok;
    } catch {
      this.reachable = false;
    }
    if (!this.reachable) {
      console.log(`[AXL] Node at ${this.baseUrl} is not reachable — using in-process fallback`);
    }
    return this.reachable;
  }

  async getPeerId(): Promise<string> {
    if (this.cachedPeerId) return this.cachedPeerId;
    try {
      const topology = await this.getTopology();
      const peerId = String(topology.our_public_key || topology.publicKey || `local-${new URL(this.baseUrl).port}`);
      this.cachedPeerId = peerId;
      return peerId;
    } catch {
      const fallback = `local-${new URL(this.baseUrl).port}`;
      this.cachedPeerId = fallback;
      return fallback;
    }
  }

  async getTopology(): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/topology`);
    if (!res.ok) throw new Error(`AXL topology failed: ${res.status}`);
    return res.json() as Promise<Record<string, unknown>>;
  }

  async send(destinationPeerId: string, message: AXLMessage): Promise<void> {
    const res = await fetch(`${this.baseUrl}/send`, {
      method: "POST",
      headers: {
        "X-Destination-Peer-Id": destinationPeerId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    if (!res.ok) throw new Error(`AXL send failed: ${res.status}`);
  }

  async receive(): Promise<AXLReceivedMessage | null> {
    const res = await fetch(`${this.baseUrl}/recv`);
    if (res.status !== 200) return null;
    const from = res.headers.get("X-From-Peer-Id") || "unknown";
    return { from, data: (await res.json()) as AXLMessage };
  }
}

// ── AXL Message Router ─────────────────────────────────────────────────────

/**
 * Routes AXL messages between agents, using real nodes when available,
 * falling back to the in-process EventEmitter bus.
 */
export class AXLRouter {
  private readonly clients: Map<string, AXLClient>;
  private readonly listeners = new Map<string, (msg: AXLReceivedMessage) => void>();
  private reachableNodes: Set<string> = new Set();

  constructor(clients: Map<string, AXLClient>) {
    this.clients = clients;
  }

  /** Initialize: test which nodes are reachable */
  async init(): Promise<void> {
    for (const [nodeId, client] of this.clients) {
      const ok = await client.checkReachable();
      if (ok) {
        this.reachableNodes.add(nodeId);
        console.log(`[AXL] Node ${nodeId} (${(client as any).baseUrl}) ✅ reachable`);
      }
    }
    if (this.reachableNodes.size === 0) {
      console.log("[AXL] No nodes reachable — running in in-process mesh mode");
    } else {
      console.log(`[AXL] ${this.reachableNodes.size}/${this.clients.size} nodes reachable`);
    }
  }

  /**
   * Send a message from one agent (on nodeId) to a destination peer.
   * Uses the real AXL HTTP API if reachable, otherwise local bus.
   */
  async send(
    fromNodeId: string,
    destinationPeerId: string,
    message: AXLMessage
  ): Promise<void> {
    const client = this.clients.get(fromNodeId);
    if (client && this.reachableNodes.has(fromNodeId)) {
      try {
        await client.send(destinationPeerId, message);
        return;
      } catch (err) {
        console.warn(`[AXL] Real send failed (${fromNodeId} → ${destinationPeerId}):`, (err as Error).message);
      }
    }
    // Fallback: local bus delivery
    localBus.emit(`msg:${destinationPeerId}`, { from: message.from, data: message });
    localBus.emit("msg:broadcast", { from: message.from, data: message });
  }

  /**
   * Broadcast a message to all peers (task announcement, etc.)
   */
  async broadcast(fromNodeId: string, message: AXLMessage): Promise<void> {
    localBus.emit("msg:broadcast", { from: message.from, data: message });

    // Also send via real nodes if available
    const client = this.clients.get(fromNodeId);
    if (client && this.reachableNodes.has(fromNodeId)) {
      try {
        const peerId = await client.getPeerId();
        await client.send(peerId, message); // self-send triggers broadcast on mesh
      } catch {
        // Non-fatal
      }
    }
  }

  /**
   * Subscribe to messages for a specific peer ID.
   */
  onMessage(peerId: string, handler: (msg: AXLReceivedMessage) => void): () => void {
    const listener = (msg: AXLReceivedMessage) => handler(msg);
    localBus.on(`msg:${peerId}`, listener);
    this.listeners.set(peerId, listener);
    return () => {
      localBus.off(`msg:${peerId}`, listener);
      this.listeners.delete(peerId);
    };
  }

  /**
   * Subscribe to all broadcast messages.
   */
  onBroadcast(handler: (msg: AXLReceivedMessage) => void): () => void {
    localBus.on("msg:broadcast", handler);
    return () => localBus.off("msg:broadcast", handler);
  }

  /** Get real node topology (for API exposure) */
  async getTopology(): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = { mode: "in-process-fallback", nodes: {} };
    for (const [nodeId, client] of this.clients) {
      if (this.reachableNodes.has(nodeId)) {
        try {
          (result.nodes as Record<string, unknown>)[nodeId] = await client.getTopology();
          result.mode = "p2p-mesh";
        } catch {
          (result.nodes as Record<string, unknown>)[nodeId] = { status: "error" };
        }
      } else {
        (result.nodes as Record<string, unknown>)[nodeId] = { status: "unreachable" };
      }
    }
    return result;
  }
}

/** Build a standard AXL message */
export function buildAXLMessage(
  type: AXLMessage["type"],
  from: string,
  to: string,
  payload: unknown,
  taskId?: string
): AXLMessage {
  return {
    type,
    from,
    to,
    taskId,
    payload,
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
  };
}

export function createConfiguredAXLClients(): Map<string, AXLClient> {
  return new Map([
    ["node-a", new AXLClient(Number(process.env.AXL_NODE_A_PORT || 9002))],
    ["node-b", new AXLClient(Number(process.env.AXL_NODE_B_PORT || 9012))],
  ]);
}

export function createConfiguredAXLRouter(): AXLRouter {
  return new AXLRouter(createConfiguredAXLClients());
}
