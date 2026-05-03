/**
 * Agent API Routes — 0G Chain
 * All operations go directly to AgentNFT contract
 */

import { Router, type Request, type Response } from "express";
import { parseEther } from "ethers";
import {
  mintAgent, getAgent, getAgentsByOwner,
  updateReputation, recordEarnings, totalAgents,
} from "../contracts/index.js";
import { AgentRole } from "../types/index.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { to, name, role, metadataURI } = req.body;
    if (!to || !name || role === undefined || !metadataURI) {
      return res.status(400).json({ error: "to, name, role, metadataURI required" });
    }
    const result = await mintAgent(to, name, role, metadataURI);
    res.status(201).json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get("/total", async (_req: Request, res: Response) => {
  try {
    res.json({ total: await totalAgents() });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get("/owner/:address", async (req: Request, res: Response) => {
  try {
    const agents = await getAgentsByOwner(req.params.address);
    res.json(agents);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const agent = await getAgent(parseInt(req.params.id));
    res.json(agent);
  } catch (err) { res.status(404).json({ error: (err as Error).message }); }
});

router.patch("/:id/reputation", async (req: Request, res: Response) => {
  try {
    const { reputation } = req.body;
    if (reputation === undefined) return res.status(400).json({ error: "reputation required" });
    const txHash = await updateReputation(parseInt(req.params.id), reputation);
    res.json({ success: true, txHash });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post("/:id/earnings", async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "amount required" });
    const txHash = await recordEarnings(parseInt(req.params.id), parseEther(amount));
    res.json({ success: true, txHash });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
