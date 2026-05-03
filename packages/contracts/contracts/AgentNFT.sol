// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentNFT
 * @notice ERC-7857 inspired iNFT — each AI agent is an on-chain NFT with
 *         embedded identity metadata pointing to its intelligence on 0G Storage.
 * @dev Deployed on 0G Chain (EVM, Cancun fork).
 */
contract AgentNFT is ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;

    struct AgentInfo {
        string name;
        string role;          // coordinator | developer | researcher | critic | trader
        string metadataUri;   // 0G Storage hash → personality vector, memory pointer
        uint256 reputation;   // 0-1000 basis points, updated by TaskManager
        uint256 totalEarnings;
        uint256 tasksCompleted;
        uint256 createdAt;
        bool active;
    }

    mapping(uint256 => AgentInfo) public agents;

    // ── Events ──────────────────────────────────────
    event AgentRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string role,
        string name
    );
    event AgentMetadataUpdated(uint256 indexed tokenId, string newMetadataUri);
    event AgentDeactivated(uint256 indexed tokenId);
    event AgentReactivated(uint256 indexed tokenId);
    event ReputationUpdated(uint256 indexed tokenId, uint256 newReputation);
    event EarningsRecorded(uint256 indexed tokenId, uint256 amount, uint256 totalEarnings);

    // ── Errors ──────────────────────────────────────
    error NotAgentOwner();
    error AgentNotActive();
    error InvalidRole();

    // ── Valid roles ─────────────────────────────────
    mapping(string => bool) public validRoles;

    constructor() ERC721("AgentVerse Agent", "AVA") Ownable(msg.sender) {
        validRoles["coordinator"] = true;
        validRoles["developer"] = true;
        validRoles["researcher"] = true;
        validRoles["critic"] = true;
        validRoles["trader"] = true;
    }

    // ── Modifiers ───────────────────────────────────
    modifier onlyAgentOwner(uint256 tokenId) {
        if (ownerOf(tokenId) != msg.sender) revert NotAgentOwner();
        _;
    }

    // ── Core Functions ──────────────────────────────

    /**
     * @notice Mint a new agent iNFT
     * @param name Display name for the agent
     * @param role One of: coordinator, developer, researcher, critic, trader
     * @param metadataUri 0G Storage URI pointing to personality + config JSON
     */
    function mintAgent(
        string calldata name,
        string calldata role,
        string calldata metadataUri
    ) external returns (uint256) {
        if (!validRoles[role]) revert InvalidRole();

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        agents[tokenId] = AgentInfo({
            name: name,
            role: role,
            metadataUri: metadataUri,
            reputation: 500, // Start at 50% reputation
            totalEarnings: 0,
            tasksCompleted: 0,
            createdAt: block.timestamp,
            active: true
        });

        emit AgentRegistered(tokenId, msg.sender, role, name);
        return tokenId;
    }

    /**
     * @notice Update the agent's off-chain metadata pointer (0G Storage)
     */
    function updateMetadata(
        uint256 tokenId,
        string calldata newUri
    ) external onlyAgentOwner(tokenId) {
        agents[tokenId].metadataUri = newUri;
        emit AgentMetadataUpdated(tokenId, newUri);
    }

    /**
     * @notice Deactivate an agent (stops it from receiving tasks)
     */
    function deactivateAgent(uint256 tokenId) external onlyAgentOwner(tokenId) {
        agents[tokenId].active = false;
        emit AgentDeactivated(tokenId);
    }

    /**
     * @notice Reactivate a deactivated agent
     */
    function reactivateAgent(uint256 tokenId) external onlyAgentOwner(tokenId) {
        agents[tokenId].active = true;
        emit AgentReactivated(tokenId);
    }

    /**
     * @notice Update agent reputation (called by TaskManager after task completion)
     * @dev In production, restrict to TaskManager contract address
     */
    function updateReputation(
        uint256 tokenId,
        uint256 newReputation
    ) external {
        // TODO: restrict to TaskManager contract
        require(newReputation <= 1000, "Reputation max 1000");
        agents[tokenId].reputation = newReputation;
        emit ReputationUpdated(tokenId, newReputation);
    }

    /**
     * @notice Record earnings for an agent (called after payment distribution)
     */
    function recordEarnings(uint256 tokenId, uint256 amount) external {
        // TODO: restrict to TaskManager contract
        agents[tokenId].totalEarnings += amount;
        agents[tokenId].tasksCompleted += 1;
        emit EarningsRecorded(tokenId, amount, agents[tokenId].totalEarnings);
    }

    // ── View Functions ──────────────────────────────

    function getAgent(uint256 tokenId) external view returns (AgentInfo memory) {
        return agents[tokenId];
    }

    function isActiveAgent(uint256 tokenId) external view returns (bool) {
        return agents[tokenId].active;
    }

    function getAgentsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

    function totalAgents() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Add a new valid role (owner only, for extensibility)
     */
    function addRole(string calldata role) external onlyOwner {
        validRoles[role] = true;
    }
}
