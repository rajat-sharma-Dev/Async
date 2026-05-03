/**
 * AgentVerse Backend - Express + WebSocket Server
 * 📖 Ref: docs/BACKEND.md
 *
 * Chain architecture:
 *   0G Chain (16602) - Agent identity, tasks, auctions via ethers.js
 *   Base (8453)      - USDC payments via KeeperHub x402
 */

import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env from repo root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });

// Routes
import taskRoutes from "./routes/tasks.js";
import agentRoutes from "./routes/agents.js";

// Services
import { getSigner, getDeployerBalance } from "./contracts/index.js";
import { getLLM } from "./llm/provider.js";
import { getKeeperHub } from "./payments/keeperhub.js";
import { CONTRACT_ADDRESSES, CHAIN_CONFIG } from "./types/index.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

// ── Middleware ────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────
app.use("/api/tasks", taskRoutes);
app.use("/api/agents", agentRoutes);

// ── Health Check ──────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    const balance = await getDeployerBalance();
    res.json({
      status: "ok",
      service: "agentverse-backend",
      version: "0.2.0",
      timestamp: new Date().toISOString(),
      chains: {
        agentVerse: {
          name: CHAIN_CONFIG.name,
          chainId: CHAIN_CONFIG.chainId,
          purpose: "Agent identity, tasks, auctions",
        },
        payments: {
          name: "Base",
          chainId: 8453,
          purpose: "USDC payments via KeeperHub x402",
        },
      },
      contracts: CONTRACT_ADDRESSES,
      wallet: { balance: `${balance} A0GI` },
    });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      error: (err as Error).message,
    });
  }
});

// ── LLM Endpoints ─────────────────────────────────
app.get("/api/llm/models", async (_req, res) => {
  try {
    const models = await getLLM().listModels();
    res.json({ count: models.length, models });
  } catch (err) {
    res.status(503).json({ error: (err as Error).message });
  }
});

app.post("/api/llm/chat", async (req, res) => {
  try {
    const { messages, options } = req.body;
    if (!messages?.length) {
      return res.status(400).json({ error: "messages array required" });
    }
    const response = await getLLM().chat(messages, options || {});
    res.json(response);
  } catch (err) {
    res.status(503).json({ error: (err as Error).message });
  }
});

// ── KeeperHub Endpoints ───────────────────────────
app.get("/api/payments/spend-cap", async (_req, res) => {
  try {
    const cap = await getKeeperHub().getSpendCap();
    res.json(cap);
  } catch (err) {
    res.status(503).json({ error: (err as Error).message });
  }
});

app.get("/api/payments/workflows", async (_req, res) => {
  try {
    const workflows = await getKeeperHub().listWorkflows();
    res.json(workflows);
  } catch (err) {
    res.status(503).json({ error: (err as Error).message });
  }
});

// ── HTTP + WebSocket Server ───────────────────────
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log("[WS] Received:", msg.event);
    } catch {
      console.warn("[WS] Invalid message format");
    }
  });

  ws.on("close", () => console.log("[WS] Client disconnected"));

  ws.send(
    JSON.stringify({
      event: "connected",
      data: { contracts: CONTRACT_ADDRESSES, chain: CHAIN_CONFIG },
      timestamp: Date.now(),
    })
  );
});

export function broadcast(event: string, data: any) {
  const message = JSON.stringify({ event, data, timestamp: Date.now() });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
}

// ── Startup ───────────────────────────────────────
server.listen(PORT, async () => {
  const signer = getSigner();
  const balance = await getDeployerBalance();

  console.log([
    "",
    "  AgentVerse Backend v0.2.0",
    "  ─────────────────────────────────────────",
    `  HTTP  -> http://localhost:${PORT}`,
    `  WS    -> ws://localhost:${PORT}`,
    "  ─────────────────────────────────────────",
    `  0G Testnet  (Chain ${CHAIN_CONFIG.chainId})`,
    `  Wallet:     ${signer.address}`,
    `  Balance:    ${balance} A0GI`,
    "  ─────────────────────────────────────────",
    `  AgentNFT:     ${CONTRACT_ADDRESSES.AgentNFT}`,
    `  TaskManager:  ${CONTRACT_ADDRESSES.TaskManager}`,
    `  Auction:      ${CONTRACT_ADDRESSES.Auction}`,
    "  ─────────────────────────────────────────",
    "  LLM:    0G Compute Router (deepseek-v3)",
    "  Payments: KeeperHub x402 (Base USDC)",
    "",
  ].join("\n"));
});
