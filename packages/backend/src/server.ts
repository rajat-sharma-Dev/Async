// packages/backend/src/server.ts
// AgentVerse Backend — Express + WebSocket entry point

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import 'dotenv/config';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'agentverse-backend',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Import and mount route modules
// app.use('/api/tasks', taskRoutes);
// app.use('/api/agents', agentRoutes);
// app.use('/api/payments', paymentRoutes);

// Create HTTP server
const server = createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WS] Client connected');

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
  });
});

// Broadcast helper
export function broadcast(event: string, data: any) {
  const message = JSON.stringify({ event, data, timestamp: Date.now() });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// Start
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     AgentVerse Backend v0.1.0         ║
  ║     http://localhost:${PORT}             ║
  ╚═══════════════════════════════════════╝
  `);
});
  ║  Auction:     ${ CONTRACT_ADDRESSES.Auction.slice(0, 20) }... ║
  ╠═══════════════════════════════════════════════╣
  ║  LLM: 0G Compute Router(deepseek - v3)        ║
  ╚═══════════════════════════════════════════════╝
`);
});
