# 💾 0G_INTEGRATION.md — 0G Chain, Storage & Compute

> **Sources of truth:**
> - [tracks-docs/OG-chain.md](./tracks-docs/OG-chain.md) — Chain deployment, Hardhat config, verification
> - [tracks-docs/OG-storage.md](./tracks-docs/OG-storage.md) — Storage SDK, KV operations, CLI
> - [tracks-docs/OG-compute.md](./tracks-docs/OG-compute.md) — Compute Router, inference API

---

## 1. 0G Chain — Smart Contract Deployment

### Network Configuration

| Network | RPC URL | Chain ID | Explorer |
|---------|---------|----------|----------|
| **Testnet (Galileo)** | `https://evmrpc-testnet.0g.ai` | `16602` | [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai) |
| **Mainnet** | `https://evmrpc.0g.ai` | `16661` | [chainscan.0g.ai](https://chainscan.0g.ai) |

**Faucet (testnet tokens):** [faucet.0g.ai](https://faucet.0g.ai/)

### Hardhat Configuration

```javascript
// packages/contracts/hardhat.config.js
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-toolbox-viem");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      evmVersion: "cancun", // ⚠️ REQUIRED for 0G Chain compatibility
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "0g-testnet": {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: [process.env.PRIVATE_KEY],
    },
    "0g-mainnet": {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      "0g-testnet": "placeholder", // Use placeholder if no API key
      "0g-mainnet": "placeholder",
    },
    customChains: [
      {
        network: "0g-testnet",
        chainId: 16602,
        urls: {
          apiURL: "https://chainscan-galileo.0g.ai/open/api",
          browserURL: "https://chainscan-galileo.0g.ai",
        },
      },
      {
        network: "0g-mainnet",
        chainId: 16661,
        urls: {
          apiURL: "https://chainscan.0g.ai/open/api",
          browserURL: "https://chainscan.0g.ai",
        },
      },
    ],
  },
};
```

### Compilation

```bash
# Must specify cancun EVM version
npx hardhat compile
```

### Deployment

```bash
# Deploy to testnet
npx hardhat run scripts/deploy.js --network 0g-testnet
```

### Contract Verification

```bash
npx hardhat verify DEPLOYED_CONTRACT_ADDRESS --network 0g-testnet
```

### Frontend Wallet Config (MetaMask)

```typescript
// packages/frontend/src/config/chains.ts
export const OG_TESTNET = {
  chainId: '0x40DA', // 16602 in hex
  chainName: '0G Chain Testnet (Galileo)',
  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls: ['https://chainscan-galileo.0g.ai'],
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
    decimals: 18,
  },
};

export const OG_MAINNET = {
  chainId: '0x4115', // 16661 in hex
  chainName: '0G Chain',
  rpcUrls: ['https://evmrpc.0g.ai'],
  blockExplorerUrls: ['https://chainscan.0g.ai'],
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
    decimals: 18,
  },
};

// Add network to MetaMask
export async function addOGNetwork(network: 'testnet' | 'mainnet') {
  const config = network === 'testnet' ? OG_TESTNET : OG_MAINNET;
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [config],
  });
}
```

---

## 2. 0G Storage — Agent Memory

### Overview

0G Storage provides decentralized file and KV storage. For AgentVerse, we use:
- **KV Store** — Agent dynamic state/memory (mutable key-value pairs)
- **File Storage** — Immutable task results and audit logs

### TypeScript Starter Kit

```bash
git clone https://github.com/0gfoundation/0g-storage-ts-starter-kit
cd 0g-storage-ts-starter-kit && npm install
cp .env.example .env   # Add your PRIVATE_KEY
npm run upload -- ./file.txt
```

### KV Operations (CLI)

The KV store uses **stream IDs** to namespace data and supports batch read/write.

#### Write to KV Store

```bash
0g-storage-client kv-write \
  --url https://evmrpc-testnet.0g.ai \
  --key $PRIVATE_KEY \
  --indexer $STORAGE_INDEXER_ENDPOINT \
  --stream-id $STREAM_ID \
  --stream-keys "key1,key2,key3" \
  --stream-values "value1,value2,value3"
```

> ⚠️ `--stream-keys` and `--stream-values` are comma-separated and must have equal length.

#### Read from KV Store

```bash
0g-storage-client kv-read \
  --node $KV_NODE_RPC_ENDPOINT \
  --stream-id $STREAM_ID \
  --stream-keys "key1,key2"
```

> ⚠️ For KV **read**, use `--node` (KV node URL), NOT `--indexer`.

### Agent Memory Schema

Each agent gets its own **stream ID** based on its token ID:

```typescript
// packages/backend/src/storage/zerog.ts

interface AgentMemorySchema {
  // Stream ID = agent token ID (uint)
  streamId: number;

  // Keys within the stream:
  keys: {
    'state':           string; // JSON: { lifecycle, currentSwarm, reputation }
    'memory':          string; // JSON: { recentContext, learnings, preferences }
    'task_history':    string; // JSON: TaskResult[]
    'earnings':        string; // JSON: { total, history }
  };
}

// Example write:
// 0g-storage-client kv-write --stream-id 42 --stream-keys "state,memory" \
//   --stream-values '{"lifecycle":"IDLE"}','{"recentContext":"..."}'
```

### File Upload (for task results/audit)

```bash
# Upload a task result file
0g-storage-client upload \
  --url https://evmrpc-testnet.0g.ai \
  --key $PRIVATE_KEY \
  --indexer $STORAGE_INDEXER_ENDPOINT \
  --file ./task-result.json

# Download by root hash
0g-storage-client download \
  --indexer $STORAGE_INDEXER_ENDPOINT \
  --root $ROOT_HASH \
  --file ./downloaded-result.json \
  --proof  # Enable merkle proof verification
```

### TypeScript Wrapper (Backend)

```typescript
// packages/backend/src/storage/zerog.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ZeroGMemory {
  private indexerUrl: string;
  private kvNodeUrl: string;
  private rpcUrl: string;
  private privateKey: string;

  constructor(config: {
    indexerUrl: string;
    kvNodeUrl: string;
    rpcUrl: string;
    privateKey: string;
  }) {
    this.indexerUrl = config.indexerUrl;
    this.kvNodeUrl = config.kvNodeUrl;
    this.rpcUrl = config.rpcUrl;
    this.privateKey = config.privateKey;
  }

  async writeKV(streamId: number, keys: string[], values: string[]): Promise<void> {
    if (keys.length !== values.length) {
      throw new Error('Keys and values must have equal length');
    }
    await execAsync(
      `0g-storage-client kv-write ` +
      `--url ${this.rpcUrl} ` +
      `--key ${this.privateKey} ` +
      `--indexer ${this.indexerUrl} ` +
      `--stream-id ${streamId} ` +
      `--stream-keys "${keys.join(',')}" ` +
      `--stream-values "${values.map(v => v.replace(/"/g, '\\"')).join(',')}"`
    );
  }

  async readKV(streamId: number, keys: string[]): Promise<Map<string, string>> {
    const { stdout } = await execAsync(
      `0g-storage-client kv-read ` +
      `--node ${this.kvNodeUrl} ` +
      `--stream-id ${streamId} ` +
      `--stream-keys "${keys.join(',')}"`
    );
    // Parse CLI output into key-value map
    const result = new Map<string, string>();
    // TODO: Parse actual CLI output format
    return result;
  }

  // Convenience methods
  async getAgentState(tokenId: number): Promise<any> {
    const data = await this.readKV(tokenId, ['state']);
    return JSON.parse(data.get('state') || '{}');
  }

  async setAgentState(tokenId: number, state: any): Promise<void> {
    await this.writeKV(tokenId, ['state'], [JSON.stringify(state)]);
  }

  async getAgentMemory(tokenId: number): Promise<any> {
    const data = await this.readKV(tokenId, ['memory']);
    return JSON.parse(data.get('memory') || '{}');
  }

  async updateAgentMemory(tokenId: number, memory: any): Promise<void> {
    await this.writeKV(tokenId, ['memory'], [JSON.stringify(memory)]);
  }
}
```

---

## 3. 0G Compute — Decentralized LLM Inference 🔥

### THIS IS THE LLM PROVIDER FOR AGENTVERSE

The 0G Compute Router provides an **OpenAI-compatible API** for decentralized AI inference. This means our agents' thinking runs on decentralized GPU infrastructure — no OpenAI dependency.

### Why This Matters for AgentVerse

- **Fully decentralized stack**: Agents think (0G Compute), remember (0G Storage), live (0G Chain), communicate (AXL), and pay (x402) — ALL decentralized
- **OpenAI drop-in**: Same API, same SDKs — just change `base_url`
- **TEE-verified**: Cryptographic proof that the model actually ran
- **Per-token billing**: No subscriptions, pay with 0G tokens

### Setup

1. **Get an API key** at [pc.0g.ai](https://pc.0g.ai/) (testnet: [pc.testnet.0g.ai](https://pc.testnet.0g.ai/))
2. **Deposit 0G tokens** for billing
3. **Use the OpenAI-compatible endpoint**

### API Endpoints

| Network | Web UI | API Endpoint |
|---------|--------|-------------|
| **Mainnet** | [pc.0g.ai](https://pc.0g.ai/) | `https://router-api.0g.ai/v1` |
| **Testnet** | [pc.testnet.0g.ai](https://pc.testnet.0g.ai/) | `https://router-api-testnet.integratenetwork.work/v1` |

### OpenAI-Compatible Usage

```bash
# Test it — it's literally the OpenAI API
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Available Models

```bash
# List all available models
curl https://router-api.0g.ai/v1/models
```

Models include `zai-org/GLM-5-FP8` and others. Check [pc.0g.ai](https://pc.0g.ai/) for the current catalog with pricing.

### Features Supported

| Feature | Status | Notes |
|---------|--------|-------|
| Chat Completions | ✅ | `/v1/chat/completions` |
| Streaming | ✅ | `"stream": true` |
| Tool Calling | ✅ | Model-dependent — check capability flags |
| JSON Mode | ✅ | `"response_format": {"type": "json_object"}` |
| Image Generation | ✅ | `/v1/images/generations` |
| Audio Transcription | ✅ | `/v1/audio/transcriptions` |
| TEE Verification | ✅ | `"verify_tee": true` |

### Pricing

```
total_cost = (input_tokens × prompt_price) + (output_tokens × completion_price)
```

Prices in **neuron per token** (1e18 neuron = 1 0G). Check balance:

```bash
curl https://router-api.0g.ai/v1/account/balance \
  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

### AgentVerse LLM Provider (Drop-in Replacement)

```typescript
// packages/backend/src/llm/provider.ts

export interface LLMProvider {
  complete(prompt: string, options?: LLMOptions): Promise<string>;
  chat(messages: ChatMessage[], options?: LLMOptions): Promise<string>;
}

export interface LLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  tools?: any[];
  responseFormat?: { type: string };
}

/**
 * 0G Compute Router — OpenAI-compatible, decentralized LLM inference
 * Uses TEE-verified providers on the 0G Compute Network
 */
export class ZeroGComputeProvider implements LLMProvider {
  private baseUrl: string;
  private apiKey: string;
  private defaultModel: string;

  constructor() {
    // Use testnet for hackathon, mainnet for production
    this.baseUrl = process.env.LLM_BASE_URL || 'https://router-api.0g.ai/v1';
    this.apiKey = process.env.LLM_API_KEY || '';
    this.defaultModel = process.env.LLM_MODEL || 'zai-org/GLM-5-FP8';
  }

  async complete(prompt: string, options?: LLMOptions): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        messages,
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7,
        stream: options?.stream || false,
        ...(options?.tools ? { tools: options.tools } : {}),
        ...(options?.responseFormat ? { response_format: options.responseFormat } : {}),
        verify_tee: true, // Always verify TEE for trustworthiness
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`0G Compute error: ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();

    // Log billing info for transparency
    if (data.x_0g_trace) {
      console.log(`[0G Compute] Provider: ${data.x_0g_trace.provider}, ` +
        `Cost: ${data.x_0g_trace.billing?.total_cost} neuron, ` +
        `TEE verified: ${data.x_0g_trace.tee_verified}`);
    }

    return data.choices[0].message.content;
  }
}

/**
 * Fallback: OpenAI-compatible provider for testing
 */
export class OpenAIProvider implements LLMProvider {
  async complete(prompt: string, options?: LLMOptions): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages,
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7,
      }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }
}

// Factory — default to 0G Compute, fall back to OpenAI
export function createLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || '0g';
  switch (provider) {
    case '0g': return new ZeroGComputeProvider();
    case 'openai': return new OpenAIProvider();
    default: return new ZeroGComputeProvider();
  }
}
```

### Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| `400` | Bad request / unsupported feature for model | Check model capability flags |
| `401` | Invalid API key | Check `LLM_API_KEY` env var |
| `402` | Insufficient balance | Deposit more 0G tokens at pc.0g.ai |
| `429` | Rate limited | Honor `Retry-After` header |
| `502` | Provider error (failover exhausted) | Retry or try different model |
| `503` | No healthy providers | Wait or use different model |

---

## Environment Variables Summary

```bash
# .env — 0G Integration

# 0G Chain
PRIVATE_KEY=0x...                           # Deployer/signer private key
OG_RPC_URL=https://evmrpc-testnet.0g.ai    # Chain RPC
OG_CHAIN_ID=16602                           # Testnet chain ID

# 0G Storage
STORAGE_INDEXER_URL=...                     # Storage indexer endpoint
STORAGE_KV_NODE_URL=...                     # KV node RPC (for reads)

# 0G Compute (LLM)
LLM_PROVIDER=0g                             # Use 0G Compute
LLM_BASE_URL=https://router-api.0g.ai/v1   # Or testnet URL
LLM_API_KEY=sk-...                          # From pc.0g.ai
LLM_MODEL=zai-org/GLM-5-FP8                # Default model

# Contract Addresses (after deployment)
AGENT_NFT_ADDRESS=0x...
TASK_MANAGER_ADDRESS=0x...
AUCTION_ADDRESS=0x...
```

---

## What We Still Need

> [!IMPORTANT]
> The 0G Storage docs show CLI and Go SDK usage, but the **TypeScript KV SDK** details are sparse.
> We need to check the [TS Starter Kit repo](https://github.com/0gfoundation/0g-storage-ts-starter-kit)
> for KV operations or fall back to CLI wrappers.

> [!NOTE]
> For hackathon, we need:
> 1. Storage indexer and KV node endpoint URLs (published in 0G's network overview docs)
> 2. A 0G Compute API key from [pc.0g.ai](https://pc.0g.ai/) or testnet equivalent
> 3. Testnet 0G tokens from the [faucet](https://faucet.0g.ai/)
