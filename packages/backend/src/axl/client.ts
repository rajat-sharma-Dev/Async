import type { AXLMessage } from '../agents/types.js';

export interface AXLReceivedMessage {
  from: string;
  data: AXLMessage;
}

export class AXLClient {
  private readonly baseUrl: string;
  private cachedPeerId: string | null = null;

  constructor(port: number) {
    this.baseUrl = `http://127.0.0.1:${port}`;
  }

  async getPeerId(): Promise<string> {
    if (this.cachedPeerId) return this.cachedPeerId;
    const topology = await this.getTopology();
    const peerId = topology.our_public_key || topology.publicKey || `local-${new URL(this.baseUrl).port}`;
    this.cachedPeerId = String(peerId);
    return this.cachedPeerId;
  }

  async getTopology(): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/topology`);
    if (!res.ok) throw new Error(`AXL topology failed: ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  }

  async send(destinationPeerId: string, message: AXLMessage): Promise<void> {
    const res = await fetch(`${this.baseUrl}/send`, {
      method: 'POST',
      headers: {
        'X-Destination-Peer-Id': destinationPeerId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    if (!res.ok) throw new Error(`AXL send failed: ${res.status}`);
  }

  async receive(): Promise<AXLReceivedMessage | null> {
    const res = await fetch(`${this.baseUrl}/recv`);
    if (res.status !== 200) return null;
    const from = res.headers.get('X-From-Peer-Id') || 'unknown';
    return { from, data: (await res.json()) as AXLMessage };
  }
}

export function createConfiguredAXLClients(): Map<string, AXLClient> {
  return new Map([
    ['node-a', new AXLClient(Number(process.env.AXL_NODE_A_PORT || 9002))],
    ['node-b', new AXLClient(Number(process.env.AXL_NODE_B_PORT || 9012))],
  ]);
}
