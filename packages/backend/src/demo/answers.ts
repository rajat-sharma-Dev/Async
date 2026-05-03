/**
 * Demo Mode — Rich AI Responses
 * These are contextually-aware, role-specific outputs that simulate
 * live 0G Compute inference for the demo task.
 */

export const DEMO_TASK = "Build an autonomous cross-chain yield optimizer that rebalances DeFi positions across Ethereum, Base, and 0G Chain using AI agents";

export const DEMO_SUBTASK_RESULTS: Record<string, string[]> = {
  researcher: [
    `## Research: Cross-Chain Yield Optimization Landscape

**Top Yield Opportunities Identified (live scan):**
- Aave v3 on Base: 8.4% APY on USDC, TVL $2.1B — low risk
- Compound v3 on Ethereum: 6.2% APY on ETH, TVL $890M — stable
- 0G Chain native staking: 12.7% APY on A0GI — emerging, higher risk
- Curve 3pool on Base: 4.9% APY — safest anchor position

**Key Risks Flagged:**
1. Bridge latency 0G ↔ Base: ~45s average — must account for in rebalancing logic
2. Gas spikes on Ethereum L1 can erode yield margins below 2% threshold
3. 0G Chain liquidity thinner — max position size $50K before slippage impact

**Recommendation:** Allocate 60% USDC/Base, 25% ETH/Ethereum, 15% A0GI/0G with 48h rebalancing cadence.`,
  ],
  coordinator: [
    `## Architecture Plan: Autonomous Yield Optimizer

**System Components:**

\`\`\`
AgentVerse Swarm
├── ResearchAgent   → scans yield rates every 6h via on-chain oracle feeds
├── DeveloperAgent  → executes rebalancing transactions via smart contract calls
├── CriticAgent     → validates each rebalance: slippage < 0.5%, gas < $8
└── TraderAgent     → manages position sizing, stop-loss triggers at -3%
\`\`\`

**Execution Flow:**
1. Research agent fetches APY deltas from Aave, Compound, 0G
2. If delta > 1.5% threshold → trigger rebalance proposal
3. Critic validates gas cost vs yield gain (must be net positive over 7d)
4. Developer executes: bridge → deposit → confirm via 0G TaskManager.submitResult()
5. Payment distributed to all agents via KeeperHub x402 protocol

**Smart Contract:** TaskManager.sol handles escrow, result anchoring on 0G Chain
**Payment Layer:** KeeperHub USDC on Base — agents paid per completed rebalance cycle`,
  ],
  developer: [
    `## Implementation: Cross-Chain Rebalancer Contract

\`\`\`solidity
// YieldOptimizer.sol — deployed on 0G Chain
contract YieldOptimizer {
    mapping(address => Position) public positions;
    
    struct Position {
        uint256 usdcBase;    // Base chain allocation
        uint256 ethMainnet;  // Ethereum allocation  
        uint256 aogi0G;      // 0G Chain native
        uint256 lastRebalance;
    }
    
    function rebalance(
        address user,
        uint256[3] calldata newWeights  // [base%, eth%, 0g%]
    ) external onlySwarmAgent returns (bytes32 txId) {
        // Validates weights sum to 100%, executes cross-chain transfers
        require(newWeights[0]+newWeights[1]+newWeights[2]==100, "weights!=100");
        txId = keccak256(abi.encode(user, block.timestamp, newWeights));
        emit RebalanceExecuted(user, newWeights, txId);
    }
}
\`\`\`

**Integration Points:**
- Chainlink CCIP for cross-chain messaging (Base ↔ Ethereum)
- 0G native bridge for A0GI transfers
- Aave v3 \`supply()\` and \`withdraw()\` calls automated per rebalance
- All results anchored on-chain: \`TaskManager.submitResult(taskId, resultHash)\`

**Gas estimate per rebalance cycle:** ~0.003 ETH ($8.40 at current prices)`,
  ],
  critic: [
    `## Security Review & Risk Assessment

**✅ Approved with minor hardening required:**

**Vulnerabilities Addressed:**
1. ✅ Reentrancy guard added to \`rebalance()\` — uses OpenZeppelin ReentrancyGuard
2. ✅ Slippage tolerance capped at 0.5% — prevents sandwich attacks
3. ✅ Oracle price feeds use Chainlink + 15-minute TWAP — manipulation resistant
4. ⚠️  Bridge timeout: add 2-hour deadline for cross-chain ops, revert if exceeded

**Performance Validation:**
- Simulated 90-day backtest: +31.4% yield improvement over static allocation
- Worst-case scenario (ETH crash -40%): portfolio drawdown capped at -12% via stop-loss
- Gas costs: $8.40/rebalance × 12 rebalances/month = $100.80/month
- Break-even at $6,700 AUM — profitable above that threshold

**Final Verdict:** Architecture is sound. Deploy with $50K pilot cap. Audit by Certik recommended before scaling.`,
  ],
  trader: [
    `## Economic Strategy & Payment Distribution

**Yield Projections (30-day):**
- Current static yield: 5.8% APY average across positions
- Optimized yield (agent-managed): 9.2% APY projected
- **Alpha generated: +3.4% APY = +$1,700/month on $600K AUM**

**Agent Payment Structure (via KeeperHub x402):**
| Agent | Role | Share | USDC/rebalance |
|-------|------|-------|----------------|
| Architect | Coordinator | 35% | $0.70 |
| NovaCoder | Developer | 25% | $0.50 |  
| InfoHound | Researcher | 25% | $0.50 |
| QualityGate | Critic | 15% | $0.30 |

**Total cost per rebalance: $2.00 USDC**
**ROI: Each $2 payment generates ~$142 in annualized yield improvement**

**All payments settled in <30s via KeeperHub on Base — no human intervention required.**`,
  ],
};

/** Generate a realistic-looking 0x transaction hash */
export function fakeOnChainTx(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
}

/** Pick a rich demo answer for a given agent role and subtask */
export function getDemoAnswer(role: string, subtaskTitle: string): string {
  const answers = DEMO_SUBTASK_RESULTS[role];
  if (!answers || answers.length === 0) {
    return getDemoAnswerGeneric(role, subtaskTitle);
  }
  return answers[0];
}

function getDemoAnswerGeneric(role: string, title: string): string {
  return `## ${title}\n\nAnalysis complete. As the ${role} agent, I've evaluated the task requirements against current on-chain conditions.\n\n**Key findings:**\n- Cross-chain compatibility verified across 0G, Base, and Ethereum\n- Smart contract interactions validated — no reentrancy vectors found\n- Gas optimization achieved: 23% reduction via calldata packing\n- All outputs anchored to IPFS and hashed to 0G Chain via TaskManager\n\n**Deliverable:** Implementation ready for deployment. Result hash submitted on-chain for audit trail.`;
}
