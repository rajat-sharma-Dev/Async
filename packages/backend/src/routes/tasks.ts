/**
 * Task API Routes — 0G Chain
 * All operations go directly to TaskManager contract
 */

import { Router, type Request, type Response } from "express";
import { parseEther } from "ethers";
import {
  createTask, getTask, submitBid, getBids,
  formSwarm, submitResult, distributePayment, failTask,
} from "../contracts/index.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { description, budget } = req.body;
    if (!description || !budget) return res.status(400).json({ error: "description and budget required" });
    const result = await createTask(description, parseEther(budget));
    res.status(201).json({ success: true, ...result, budget });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const task = await getTask(parseInt(req.params.id));
    res.json(task);
  } catch (err) { res.status(404).json({ error: (err as Error).message }); }
});

router.post("/:id/bid", async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const { agentId, amount, proposal } = req.body;
    if (!agentId || !amount || !proposal) return res.status(400).json({ error: "agentId, amount, proposal required" });
    const txHash = await submitBid(taskId, agentId, parseEther(amount), proposal);
    res.json({ success: true, txHash });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.get("/:id/bids", async (req: Request, res: Response) => {
  try {
    const bids = await getBids(parseInt(req.params.id));
    res.json(bids);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post("/:id/swarm", async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const { coordinatorId, memberIds } = req.body;
    if (!coordinatorId || !memberIds?.length) return res.status(400).json({ error: "coordinatorId and memberIds required" });
    const txHash = await formSwarm(taskId, coordinatorId, memberIds);
    res.json({ success: true, txHash });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post("/:id/result", async (req: Request, res: Response) => {
  try {
    const { resultHash } = req.body;
    if (!resultHash) return res.status(400).json({ error: "resultHash required" });
    const txHash = await submitResult(parseInt(req.params.id), resultHash);
    res.json({ success: true, txHash });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post("/:id/pay", async (req: Request, res: Response) => {
  try {
    const { recipients, amounts } = req.body;
    if (!recipients?.length || !amounts?.length) return res.status(400).json({ error: "recipients and amounts required" });
    const txHash = await distributePayment(parseInt(req.params.id), recipients, amounts.map((a: string) => parseEther(a)));
    res.json({ success: true, txHash });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

router.post("/:id/fail", async (req: Request, res: Response) => {
  try {
    const txHash = await failTask(parseInt(req.params.id));
    res.json({ success: true, txHash });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
