// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Auction
 * @notice Time-limited auction for selecting agents to form a task swarm.
 *         Bids are scored off-chain by the coordinator; on-chain auction
 *         just enforces timing and records winners.
 * @dev Deployed on 0G Chain. Works alongside TaskManager.
 */
contract Auction {
    // ── Structs ─────────────────────────────────────
    struct AuctionInfo {
        uint256 taskId;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
        uint256[] winnerAgentIds;
        address creator;
    }

    struct AuctionBid {
        uint256 agentId;
        uint256 amount;       // Requested payment
        uint256 confidence;   // 0-100 self-assessed confidence
        string role;
        uint256 timestamp;
    }

    // ── State ───────────────────────────────────────
    mapping(uint256 => AuctionInfo) public auctions;    // taskId → auction
    mapping(uint256 => AuctionBid[]) public auctionBids; // taskId → bids

    // ── Events ──────────────────────────────────────
    event AuctionStarted(uint256 indexed taskId, uint256 endTime, address creator);
    event AuctionBidPlaced(
        uint256 indexed taskId,
        uint256 indexed agentId,
        uint256 amount,
        uint256 confidence
    );
    event AuctionFinalized(uint256 indexed taskId, uint256[] winners);
    event AuctionCancelled(uint256 indexed taskId);

    // ── Errors ──────────────────────────────────────
    error AuctionAlreadyExists();
    error AuctionNotActive();
    error AuctionNotEnded();
    error AuctionAlreadyFinalized();
    error NotAuctionCreator();

    // ── Core Functions ──────────────────────────────

    /**
     * @notice Start a new auction for a task
     * @param taskId The task to auction
     * @param durationSeconds How long the auction runs
     */
    function startAuction(
        uint256 taskId,
        uint256 durationSeconds
    ) external {
        if (auctions[taskId].startTime != 0) revert AuctionAlreadyExists();

        auctions[taskId] = AuctionInfo({
            taskId: taskId,
            startTime: block.timestamp,
            endTime: block.timestamp + durationSeconds,
            finalized: false,
            winnerAgentIds: new uint256[](0),
            creator: msg.sender
        });

        emit AuctionStarted(taskId, block.timestamp + durationSeconds, msg.sender);
    }

    /**
     * @notice Place a bid in an active auction
     */
    function placeBid(
        uint256 taskId,
        uint256 agentId,
        uint256 amount,
        uint256 confidence,
        string calldata role
    ) external {
        AuctionInfo storage auction = auctions[taskId];
        if (auction.startTime == 0 || auction.finalized) revert AuctionNotActive();
        if (block.timestamp > auction.endTime) revert AuctionNotActive();

        auctionBids[taskId].push(AuctionBid({
            agentId: agentId,
            amount: amount,
            confidence: confidence,
            role: role,
            timestamp: block.timestamp
        }));

        emit AuctionBidPlaced(taskId, agentId, amount, confidence);
    }

    /**
     * @notice Finalize the auction with selected winners
     * @dev Winners are selected off-chain by scoring algorithm, recorded here
     * @param taskId The task whose auction to finalize
     * @param winners Array of winning agent IDs
     */
    function finalizeAuction(
        uint256 taskId,
        uint256[] calldata winners
    ) external {
        AuctionInfo storage auction = auctions[taskId];
        if (auction.finalized) revert AuctionAlreadyFinalized();
        if (block.timestamp < auction.endTime) revert AuctionNotEnded();
        if (msg.sender != auction.creator) revert NotAuctionCreator();

        auction.finalized = true;
        auction.winnerAgentIds = winners;

        emit AuctionFinalized(taskId, winners);
    }

    /**
     * @notice Cancel an auction (creator only, before finalization)
     */
    function cancelAuction(uint256 taskId) external {
        AuctionInfo storage auction = auctions[taskId];
        if (msg.sender != auction.creator) revert NotAuctionCreator();
        if (auction.finalized) revert AuctionAlreadyFinalized();

        auction.finalized = true; // Prevent further bids
        emit AuctionCancelled(taskId);
    }

    // ── View Functions ──────────────────────────────

    function getAuction(uint256 taskId) external view returns (AuctionInfo memory) {
        return auctions[taskId];
    }

    function getBids(uint256 taskId) external view returns (AuctionBid[] memory) {
        return auctionBids[taskId];
    }

    function getBidCount(uint256 taskId) external view returns (uint256) {
        return auctionBids[taskId].length;
    }

    function isAuctionActive(uint256 taskId) external view returns (bool) {
        AuctionInfo storage auction = auctions[taskId];
        return auction.startTime != 0 &&
               !auction.finalized &&
               block.timestamp <= auction.endTime;
    }

    function getWinners(uint256 taskId) external view returns (uint256[] memory) {
        return auctions[taskId].winnerAgentIds;
    }
}
