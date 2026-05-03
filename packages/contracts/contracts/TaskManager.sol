// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TaskManager
 * @notice Manages task lifecycle: creation → bidding → swarm → execution → completion → payment.
 * @dev Budget is held in escrow (native 0G tokens). Deployed on 0G Chain.
 */
contract TaskManager {
    // ── Enums ───────────────────────────────────────
    enum TaskStatus {
        Open,        // Accepting bids
        Bidding,     // Auction active
        InProgress,  // Swarm formed, agents working
        Review,      // Awaiting quality review
        Completed,   // Done, payments distributed
        Failed       // Timed out or failed
    }

    // ── Structs ─────────────────────────────────────
    struct Task {
        uint256 id;
        address requester;
        string description;
        uint256 budget;         // Native 0G tokens in escrow
        TaskStatus status;
        uint256 coordinatorAgentId;
        uint256 createdAt;
        uint256 completedAt;
        string resultHash;      // 0G Storage hash of final result
    }

    struct Bid {
        uint256 agentId;
        uint256 amount;         // How much the agent wants (in wei)
        uint256 confidence;     // 0-100
        string role;
        string proposal;        // Brief text on how agent will approach
        uint256 timestamp;
    }

    // ── State ───────────────────────────────────────
    uint256 public taskCount;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => Bid[]) public taskBids;
    mapping(uint256 => uint256[]) public taskSwarm;  // taskId → agentIds in swarm
    mapping(uint256 => bool) public paymentDistributed;

    // ── Events ──────────────────────────────────────
    event TaskCreated(
        uint256 indexed taskId,
        address indexed requester,
        string description,
        uint256 budget
    );
    event BidSubmitted(
        uint256 indexed taskId,
        uint256 indexed agentId,
        uint256 amount,
        uint256 confidence
    );
    event SwarmFormed(
        uint256 indexed taskId,
        uint256[] agentIds,
        uint256 coordinatorId
    );
    event TaskStatusChanged(uint256 indexed taskId, TaskStatus newStatus);
    event ResultSubmitted(uint256 indexed taskId, string resultHash);
    event PaymentDistributed(
        uint256 indexed taskId,
        uint256 indexed agentId,
        address wallet,
        uint256 amount
    );

    // ── Errors ──────────────────────────────────────
    error InsufficientBudget();
    error InvalidTaskStatus(TaskStatus expected, TaskStatus actual);
    error NotTaskRequester();
    error PaymentAlreadyDistributed();
    error PaymentExceedsBudget();
    error ArrayLengthMismatch();

    // ── Modifiers ───────────────────────────────────
    modifier onlyRequester(uint256 taskId) {
        if (tasks[taskId].requester != msg.sender) revert NotTaskRequester();
        _;
    }

    modifier requireStatus(uint256 taskId, TaskStatus expected) {
        if (tasks[taskId].status != expected)
            revert InvalidTaskStatus(expected, tasks[taskId].status);
        _;
    }

    // ── Task Lifecycle ──────────────────────────────

    /**
     * @notice Create a new task with budget in escrow
     * @param description Human-readable task description
     * @return taskId The new task ID
     */
    function createTask(
        string calldata description
    ) external payable returns (uint256) {
        if (msg.value == 0) revert InsufficientBudget();

        uint256 taskId = taskCount++;
        tasks[taskId] = Task({
            id: taskId,
            requester: msg.sender,
            description: description,
            budget: msg.value,
            status: TaskStatus.Open,
            coordinatorAgentId: 0,
            createdAt: block.timestamp,
            completedAt: 0,
            resultHash: ""
        });

        emit TaskCreated(taskId, msg.sender, description, msg.value);
        return taskId;
    }

    /**
     * @notice Submit a bid for an open task
     */
    function submitBid(
        uint256 taskId,
        uint256 agentId,
        uint256 amount,
        uint256 confidence,
        string calldata role,
        string calldata proposal
    ) external requireStatus(taskId, TaskStatus.Open) {
        taskBids[taskId].push(Bid({
            agentId: agentId,
            amount: amount,
            confidence: confidence,
            role: role,
            proposal: proposal,
            timestamp: block.timestamp
        }));

        emit BidSubmitted(taskId, agentId, amount, confidence);
    }

    /**
     * @notice Form a swarm from selected agents and set coordinator
     */
    function formSwarm(
        uint256 taskId,
        uint256[] calldata agentIds,
        uint256 coordinatorId
    ) external requireStatus(taskId, TaskStatus.Open) {
        tasks[taskId].status = TaskStatus.InProgress;
        tasks[taskId].coordinatorAgentId = coordinatorId;
        taskSwarm[taskId] = agentIds;

        emit SwarmFormed(taskId, agentIds, coordinatorId);
        emit TaskStatusChanged(taskId, TaskStatus.InProgress);
    }

    /**
     * @notice Submit the final result (0G Storage hash)
     */
    function submitResult(
        uint256 taskId,
        string calldata resultHash
    ) external requireStatus(taskId, TaskStatus.InProgress) {
        tasks[taskId].status = TaskStatus.Completed;
        tasks[taskId].completedAt = block.timestamp;
        tasks[taskId].resultHash = resultHash;

        emit ResultSubmitted(taskId, resultHash);
        emit TaskStatusChanged(taskId, TaskStatus.Completed);
    }

    /**
     * @notice Distribute payment from escrow to agents
     * @param taskId The completed task
     * @param agentIds Agent IDs receiving payment
     * @param amounts Payment amount per agent (in wei)
     * @param wallets Wallet addresses to receive payment
     */
    function distributePayment(
        uint256 taskId,
        uint256[] calldata agentIds,
        uint256[] calldata amounts,
        address[] calldata wallets
    ) external requireStatus(taskId, TaskStatus.Completed) {
        if (paymentDistributed[taskId]) revert PaymentAlreadyDistributed();
        if (agentIds.length != amounts.length || amounts.length != wallets.length)
            revert ArrayLengthMismatch();

        uint256 totalPayout;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalPayout += amounts[i];
        }
        if (totalPayout > tasks[taskId].budget) revert PaymentExceedsBudget();

        paymentDistributed[taskId] = true;

        for (uint256 i = 0; i < wallets.length; i++) {
            (bool sent, ) = payable(wallets[i]).call{value: amounts[i]}("");
            require(sent, "Payment transfer failed");
            emit PaymentDistributed(taskId, agentIds[i], wallets[i], amounts[i]);
        }

        // Refund remaining budget to requester
        uint256 remaining = tasks[taskId].budget - totalPayout;
        if (remaining > 0) {
            (bool refunded, ) = payable(tasks[taskId].requester).call{value: remaining}("");
            require(refunded, "Refund failed");
        }
    }

    /**
     * @notice Mark task as failed (requester gets refund)
     */
    function failTask(
        uint256 taskId
    ) external onlyRequester(taskId) {
        require(
            tasks[taskId].status == TaskStatus.Open ||
            tasks[taskId].status == TaskStatus.InProgress,
            "Cannot fail in current status"
        );

        tasks[taskId].status = TaskStatus.Failed;
        emit TaskStatusChanged(taskId, TaskStatus.Failed);

        // Refund budget to requester
        if (!paymentDistributed[taskId]) {
            (bool sent, ) = payable(tasks[taskId].requester).call{value: tasks[taskId].budget}("");
            require(sent, "Refund failed");
        }
    }

    // ── View Functions ──────────────────────────────

    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    function getBids(uint256 taskId) external view returns (Bid[] memory) {
        return taskBids[taskId];
    }

    function getBidCount(uint256 taskId) external view returns (uint256) {
        return taskBids[taskId].length;
    }

    function getSwarm(uint256 taskId) external view returns (uint256[] memory) {
        return taskSwarm[taskId];
    }
}
