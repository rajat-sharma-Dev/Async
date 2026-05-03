// packages/backend/src/storage/zerog.ts
// 0G Storage KV — Agent memory persistence layer
// Ref: docs/0G_INTEGRATION.md → "0G Storage", docs/tracks-docs/OG-storage.md

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ZeroGMemory {
  private indexerUrl: string;
  private kvNodeUrl: string;
  private rpcUrl: string;
  private privateKey: string;

  constructor() {
    this.indexerUrl = process.env.STORAGE_INDEXER_URL || '';
    this.kvNodeUrl = process.env.STORAGE_KV_NODE_URL || '';
    this.rpcUrl = process.env.OG_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    this.privateKey = process.env.PRIVATE_KEY || '';
  }

  /**
   * Write key-value pairs to a stream (agent's namespace)
   * Uses 0g-storage-client CLI: kv-write --stream-id --stream-keys --stream-values
   */
  async writeKV(streamId: number, keys: string[], values: string[]): Promise<void> {
    if (keys.length !== values.length) {
      throw new Error('Keys and values must have equal length');
    }
    if (!this.indexerUrl) {
      console.warn('[0G Storage] No indexer URL configured, skipping write');
      return;
    }

    const cmd =
      `0g-storage-client kv-write ` +
      `--url ${this.rpcUrl} ` +
      `--key ${this.privateKey} ` +
      `--indexer ${this.indexerUrl} ` +
      `--stream-id ${streamId} ` +
      `--stream-keys "${keys.join(',')}" ` +
      `--stream-values "${values.map((v) => v.replace(/"/g, '\\"')).join(',')}"`;

    try {
      await execAsync(cmd);
    } catch (err) {
      console.error('[0G Storage] KV write failed:', err);
      throw err;
    }
  }

  /**
   * Read key-value pairs from a stream
   * Uses 0g-storage-client CLI: kv-read --node --stream-id --stream-keys
   * NOTE: Read uses --node (KV node URL), NOT --indexer
   */
  async readKV(streamId: number, keys: string[]): Promise<Map<string, string>> {
    if (!this.kvNodeUrl) {
      console.warn('[0G Storage] No KV node URL configured, returning empty');
      return new Map();
    }

    const cmd =
      `0g-storage-client kv-read ` +
      `--node ${this.kvNodeUrl} ` +
      `--stream-id ${streamId} ` +
      `--stream-keys "${keys.join(',')}"`;

    try {
      const { stdout } = await execAsync(cmd);
      // Parse CLI output into key-value map
      const result = new Map<string, string>();
      // The CLI outputs values line by line corresponding to keys
      const lines = stdout.trim().split('\n').filter(Boolean);
      keys.forEach((key, i) => {
        if (i < lines.length) {
          result.set(key, lines[i]);
        }
      });
      return result;
    } catch (err) {
      console.error('[0G Storage] KV read failed:', err);
      return new Map();
    }
  }

  // ── Convenience Methods ───────────────────────────

  /** Get agent lifecycle state */
  async getAgentState(tokenId: number): Promise<any> {
    const data = await this.readKV(tokenId, ['state']);
    const raw = data.get('state');
    return raw ? JSON.parse(raw) : { lifecycle: 'IDLE' };
  }

  /** Set agent lifecycle state */
  async setAgentState(tokenId: number, state: any): Promise<void> {
    await this.writeKV(tokenId, ['state'], [JSON.stringify(state)]);
  }

  /** Get agent memory (context, learnings, preferences) */
  async getAgentMemory(tokenId: number): Promise<any> {
    const data = await this.readKV(tokenId, ['memory']);
    const raw = data.get('memory');
    return raw ? JSON.parse(raw) : { recentContext: '', learnings: [], preferences: {} };
  }

  /** Update agent memory */
  async updateAgentMemory(tokenId: number, memory: any): Promise<void> {
    await this.writeKV(tokenId, ['memory'], [JSON.stringify(memory)]);
  }

  /** Get task history for an agent */
  async getTaskHistory(tokenId: number): Promise<any[]> {
    const data = await this.readKV(tokenId, ['task_history']);
    const raw = data.get('task_history');
    return raw ? JSON.parse(raw) : [];
  }

  /** Append a task result to history */
  async appendTaskResult(tokenId: number, result: any): Promise<void> {
    const history = await this.getTaskHistory(tokenId);
    history.push(result);
    // Keep last 50 results to avoid growing unbounded
    const trimmed = history.slice(-50);
    await this.writeKV(tokenId, ['task_history'], [JSON.stringify(trimmed)]);
  }

  /** Save full agent snapshot (state + memory in one write) */
  async saveSnapshot(
    tokenId: number,
    state: any,
    memory: any
  ): Promise<void> {
    await this.writeKV(
      tokenId,
      ['state', 'memory'],
      [JSON.stringify(state), JSON.stringify(memory)]
    );
  }
}
