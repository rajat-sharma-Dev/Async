# Untitled

# **Deploy Smart Contracts on 0G Chain**

Deploy smart contracts on 0G Chain - an EVM-compatible blockchain with built-in AI capabilities.

## **Why Deploy on 0G Chain?**

### **⚡ Performance Benefits**

- **11,000 TPS per Shard**: Higher throughput than Ethereum
- **Low Fees**: Fraction of mainnet costs
- **Sub-second Finality**: Near-instant transaction confirmation

### **🔧 Latest EVM Compatibility**

- **Pectra & Cancun-Deneb Support**: Leverage newest Ethereum capabilities
- **Future-Ready**: Architecture designed for quick integration of upcoming EVM upgrades
- **Familiar Tools**: Use Hardhat, Foundry, Remix
- **No Learning Curve**: Deploy like any EVM chain

## **Prerequisites**

Before deploying contracts on 0G Chain, ensure you have:

- Node.js 16+ installed (for Hardhat/Truffle)
- Rust installed (for Foundry)
- A wallet with testnet 0G tokens ([get from faucet](https://faucet.0g.ai/))
- Basic Solidity knowledge

## **Steps to Deploy Your Contract**

### **Step 1: Prepare Your Smart Contract Code**

Write your contract code as you would for any Ethereum-compatible blockchain, ensuring that it meets the requirements for your specific use case.

```solidity
// SPDX-License-Identifier: MITpragma solidity ^0.8.19;contract MyToken {    mapping(address => uint256) public balances;    uint256 public totalSupply;    constructor(uint256 _initialSupply) {        totalSupply = _initialSupply;        balances[msg.sender] = _initialSupply;    }    function transfer(address to, uint256 amount) public returns (bool) {        require(balances[msg.sender] >= amount, "Insufficient balance");        balances[msg.sender] -= amount;        balances[to] += amount;        return true;    }}
```

### **Step 2: Compile Your Smart Contract**

Use `solc` or another compatible Solidity compiler to compile your smart contract.

**Important**: When compiling, specify `--evm-version cancun` to ensure compatibility with the latest EVM upgrades supported by 0G Chain.

**Using solc directly**:

```bash
solc --evm-version cancun --bin --abi MyToken.sol
```

**Using Hardhat**:

```jsx
// hardhat.config.jsmodule.exports={solidity:{version:"0.8.19",settings:{evmVersion:"cancun",optimizer:{enabled:true,runs:200,},},},};
```

**Using Foundry**:

```toml
# foundry.toml[profile.default]evm_version = "cancun"
```

This step will generate the binary and ABI (Application Binary Interface) for your contract.

### **Step 3: Deploy the Contract on 0G Chain**

Once compiled, you can use your preferred Ethereum-compatible deployment tools, such as `web3.js`, `ethers.js`, or `hardhat`, to deploy the contract on 0G Chain.

**Configure Network Connection**:

```jsx
// For Hardhatnetworks:{"testnet":{url:"https://evmrpc-testnet.0g.ai",chainId:16602,accounts:[process.env.PRIVATE_KEY]},"mainnet":{url:"https://evmrpc.0g.ai",chainId:16661,accounts:[process.env.PRIVATE_KEY]}}// For Foundry[rpc_endpoints]0g_testnet="https://evmrpc-testnet.0g.ai"0g_mainnet="https://evmrpc.0g.ai"
```

**Deploy Using Your Preferred Tool**:

- **Hardhat Deployment**
- **Foundry Deployment**
- **Truffle Deployment**

Follow the same deployment steps as you would on Ethereum, using your 0G Chain node or RPC endpoint.

> For complete working examples using different frameworks, check out the official deployment scripts repository: 🔗 [**0G Deployment Scripts**](https://github.com/0gfoundation/0g-deployment-scripts)
> 

### **Step 4: Verify Deployment Results on 0G Chain Scan**

After deployment, you can verify your contract on 0G Chain Scan, the block explorer for [**0G Chain**](https://chainscan.0g.ai/) or via the provided API below:

**HardhatForge**

- **Hardhat**
- Forge

Make sure you have the following plugins installed:

```bash
npm install --save-dev @nomicfoundation/hardhat-verify @nomicfoundation/viem @nomicfoundation/hardhat-toolbox-viem dotenv
```

To verify your contract using Hardhat, please use the following settings in your `hardhat.config.js`:

```jsx
solidity:{...settings:{evmVersion:"cancun",// Make sure this matches your compiler settingoptimizer:{enabled:true,runs:200,// Adjust based on your optimization needs},viaIR:true,// Enable if your contract uses inline assemblymetadata:{bytecodeHash:"none",// Optional: Set to "none" to exclude metadata hash},},}
```

Add the network configuration:

```jsx
networks:{"testnet":{url:"https://evmrpc-testnet.0g.ai",chainId:16602,accounts:[process.env.PRIVATE_KEY]},"mainnet":{url:"https://evmrpc.0g.ai",chainId:16661,accounts:[process.env.PRIVATE_KEY]}}
```

and finally, add the etherscan configuration:

```jsx
etherscan:{apiKey:{testnet:"YOUR_API_KEY",// Use a placeholder if you don't have onemainnet:"YOUR_API_KEY"// Use a placeholder if you don't have one},customChains:[{// Testnetnetwork:"testnet",chainId:16602,urls:{apiURL:"https://chainscan-galileo.0g.ai/open/api",browserURL:"https://chainscan-galileo.0g.ai",},},{// Mainnetnetwork:"mainnet",chainId:16661,urls:{apiURL:"https://chainscan.0g.ai/open/api",browserURL:"https://chainscan.0g.ai",},},],},
```

To verify your contract, run the following command:

```bash
npx hardhat verify DEPLOYED_CONTRACT_ADDRESS --network <Network>
```

You should get a success message like this:

```bash
Successfully submitted source code for contractcontracts/Contract.sol:ContractName at DEPLOYED_CONTRACT_ADDRESSfor verification on the block explorer. Waiting for verification result...Successfully verified contract TokenDist on the block explorer.https://chainscan.0g.ai/address/<DEPLOYED_CONTRACT_ADDRESS>#code
```

## **Using 0G Precompiles**

### **Available Precompiles**

| **Precompile** | **Address** | **Purpose** |
| --- | --- | --- |
| [DASigners](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-dasigners) | `0x...1000` | Data availability signatures |
| [Wrapped0GBase](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-wrappedogbase) | `0x...1002` | Wrapped 0G token operations |

## **Troubleshooting**

- **Transaction failing with "invalid opcode"?**
- **Can't connect to RPC?**

## **What's Next?**

- **Learn Precompiles**: [Precompiles Overview](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-overview)
- **Storage Integration**: [0G Storage SDK](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk)
- **Compute Integration**: [0G Compute Guide](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/overview)

# **Staking Interfaces**

Welcome to the 0G Chain Staking Interfaces documentation. This guide provides comprehensive information about interacting with the 0G Chain staking system through smart contracts, enabling you to build applications that leverage validator operations and delegations.

**Running a Validator?**

If you want to set up and initialize a validator, see the [Validator Initialization Guide](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces#validator-initialization) below.

## **Quick Navigation**

- [**Validator Initialization Guide**](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces#validator-initialization) - Complete step-by-step setup for becoming a validator
- [**Contract Interfaces**](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces#contract-interfaces) - Smart contract reference documentation
- [**Examples**](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces#examples) - Smart contract code examples

---

## **Overview**

The 0G Chain staking system enables 0G token holders to participate in network consensus and earn rewards through two primary mechanisms:

1. **Becoming a Validator**: Run infrastructure to validate transactions and produce blocks
2. **Delegating to Validators**: Stake tokens with existing validators to earn rewards without running infrastructure

The staking system is built on two core smart contract interfaces:

- **`IStakingContract`**: Central registry managing validators and global staking parameters
- **`IValidatorContract`**: Individual validator operations including delegations and reward distribution

## **Prerequisites**

Before working with the staking interfaces:

- Familiarity with Solidity and smart contract development
- Basic knowledge of consensus mechanisms and staking concepts

## **Quick Start**

```solidity
// Create a validatorIStakingContract staking = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);address validator = staking.createAndInitializeValidatorIfNecessary{value: msg.value}(    description, commissionRate, withdrawalFee, pubkey, signature);// Delegate to validatorIValidatorContract(validator).delegate{value: msg.value}(msg.sender);
```

## **Core Concepts**

### **Validators**

Validators process transactions and produce blocks:

- **Unique Identity**: Identified by 48-byte consensus public key
- **Operator Control**: Managed by an Ethereum address
- **Commission**: Set their own reward commission rates
- **Self-Delegation**: Required minimum stake from operator

### **Delegations**

Token holders earn rewards by delegating to validators:

- **Share-Based**: Delegations represented as shares in validator pool
- **Proportional Rewards**: Earnings based on share percentage
- **Withdrawal Delay**: Undelegation subject to network delay period

### **Reward Distribution**

Rewards flow through multiple layers:

1. **Community Tax**: Applied to all rewards first
2. **Validator Commission**: Taken from remaining rewards
3. **Delegator Distribution**: Proportional to shares held

## **Contract Interfaces**

### **IStakingContract**

`0xea224dBB52F57752044c0C86aD50930091F561B9` (Mainnet)

Central registry for validators and global parameters.

### **Validator Management**

```solidity
// Create validator contractfunction createValidator(bytes calldata pubkey) external returns (address);// Initialize validator with self-delegationfunction initializeValidator(    Description calldata description,    uint32 commissionRate,    uint96 withdrawalFeeInGwei,    bytes calldata pubkey,    bytes calldata signature) external payable;// Create and initialize in one callfunction createAndInitializeValidatorIfNecessary(    Description calldata description,    uint32 commissionRate,    uint96 withdrawalFeeInGwei,    bytes calldata pubkey,    bytes calldata signature) external payable;
```

### **Query Functions**

```solidity
function getValidator(bytes memory pubkey) external view returns (address);function computeValidatorAddress(bytes calldata pubkey) external view returns (address);function validatorCount() external view returns (uint32);function maxValidatorCount() external view returns (uint32);
```

### **IValidatorContract**

Individual validator operations and delegation management.

### **Delegation Management**

```solidity
// Delegate tokens (msg.value = amount)function delegate(address delegatorAddress) external payable returns (uint);// Undelegate shares (msg.value = withdrawal fee)function undelegate(address withdrawalAddress, uint shares) external payable returns (uint);// Withdraw validator commission (only validator operator)function withdrawCommission(address withdrawalAddress) external returns (uint);
```

**Access Control**

The `withdrawCommission` function is restricted to the validator operator only - the address that originally created and manages the validator.

### **Information Queries**

```solidity
function tokens() external view returns (uint);           // Total tokens (delegated + rewards)function delegatorShares() external view returns (uint);  // Total shares issuedfunction getDelegation(address delegator) external view returns (address, uint);function commissionRate() external view returns (uint32);function withdrawalFeeInGwei() external view returns (uint96);
```

**Understanding tokens()**

The `tokens()` function returns the complete validator balance, including both the original delegated amounts and any accumulated rewards that haven't been distributed yet.

## **Examples**

### **Creating a Validator**

```solidity
// SPDX-License-Identifier: MITpragma solidity ^0.8.0;import "./IStakingContract.sol";contract ValidatorExample {    IStakingContract constant STAKING = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);    function createValidator(        bytes calldata pubkey,        bytes calldata signature    ) external payable {        Description memory desc = Description({            moniker: "My Validator",            identity: "keybase-id",            website: "https://validator.example.com",            securityContact: "security@example.com",            details: "A reliable 0G Chain validator"        });        STAKING.createAndInitializeValidatorIfNecessary{value: msg.value}(            desc,            50000,  // 5% commission            1,      // 1 Gwei withdrawal fee            pubkey,            signature        );    }}
```

### **Delegation Management**

```solidity
contract DelegationHelper {    IStakingContract constant STAKING = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);    function delegateToValidator(bytes calldata pubkey) external payable {        address validator = STAKING.getValidator(pubkey);        require(validator != address(0), "Validator not found");        IValidatorContract(validator).delegate{value: msg.value}(msg.sender);    }    function getDelegationInfo(        bytes calldata pubkey,        address delegator    ) external view returns (uint shares, uint estimatedTokens) {        address validator = STAKING.getValidator(pubkey);        IValidatorContract v = IValidatorContract(validator);        (, shares) = v.getDelegation(delegator);        uint totalTokens = v.tokens();        uint totalShares = v.delegatorShares();        if (totalShares > 0) {            estimatedTokens = (shares * totalTokens) / totalShares;        }    }}
```

## **Validator Initialization**

This section covers the complete workflow for setting up and initializing a validator on the 0G Chain.

### **Step 1: Generate Validator Signature**

The validator signature creation process is simplified with a single command:

```bash
# Set your environment variablesHOMEDIR={your data path}/0g-home/0gchaind-homeSTAKING_ADDRESS=0xea224dBB52F57752044c0C86aD50930091F561B9AMOUNT=500000000000  # Amount in wei (e.g., 500 for 500 0G tokens)# Generate validator signature./bin/0gchaind deposit create-delegation-validator \    $STAKING_ADDRESS \    $AMOUNT \    $HOMEDIR/config/genesis.json \    --home $HOMEDIR \    --chaincfg.chain-spec=mainnet \    --override-rpc-url \    --rpc-dial-url https://evmrpc.0g.ai
```

**Output:**

```
✅ Staking message created successfully!Note: This is NOT a transaction receipt; use these values to create a validator initialize transaction by Staking Contract.stakingAddress: 0xea224dBB52F57752044c0C86aD50930091F561B9pubkey: 0x8497312cd37eef3a7a50017cfbebcb00a9bc400c5881ffb1011cba1c3f29e5d005a980880b7b919b558b95565bc1e628validatorAddress: 0xA47171b1be26C75732766Ea3433a90A724b3590damount: 500000000000signature: 0xb1dae1164d931c46178785246203eb1c4496b403a7c417bfb33bdfd3c26b552bdbec8e466ed6712ade0b99cc9b0ee8b004cc766687565ba5b0929a1382997a6cc548cf5e390b69f849933c7ac017fbddc612cb3de285fdf89e6fe32e0ccbfc43
```

### **Step 2: Validate the Signature**

Before submitting the validator initialization transaction, validate the signature:

```bash
# Validate the deposit message./bin/0gchaind deposit validate-delegation \    {pubkey} \    {staking_address} \    {amount} \    {signature} \    $HOMEDIR/config/genesis.json \    --home $HOMEDIR \    --chaincfg.chain-spec=mainnet \    --override-rpc-url \    --rpc-dial-url https://evmrpc.0g.ai
```

**Example:**

```bash
./bin/0gchaind deposit validate-delegation \    0x8497312cd37eef3a7a50017cfbebcb00a9bc400c5881ffb1011cba1c3f29e5d005a980880b7b919b558b95565bc1e628 \    0xea224dBB52F57752044c0C86aD50930091F561B9 \    500000000000 \    0xb1dae1164d931c46178785246203eb1c4496b403a7c417bfb33bdfd3c26b552bdbec8e466ed6712ade0b99cc9b0ee8b004cc766687565ba5b0929a1382997a6cc548cf5e390b69f849933c7ac017fbddc612cb3de285fdf89e6fe32e0ccbfc43 \    $HOMEDIR/config/genesis.json \    --home $HOMEDIR \    --chaincfg.chain-spec=mainnet \    --override-rpc-url \    --rpc-dial-url https://evmrpc.0g.ai
```

**Output:**

```
✅ Deposit message is valid!
```

### **Step 3: Prepare Validator Description and Settings**

### **Description Structure**

The Description struct contains your validator's public information. All fields have character limits that must be respected:

| **Field** | **Max Length** | **Description** |
| --- | --- | --- |
| `moniker` | 70 chars | Your validator's display name |
| `identity` | 100 chars | **Optional:** Keybase identity |
| `website` | 140 chars | Your validator website URL |
| `securityContact` | 140 chars | Security contact email |
| `details` | 200 chars | Additional validator description |

**Example Description Object:**

```jsx
{moniker:"Your Validator Name",// Max 70 charsidentity:"keybase_id",// Optionalwebsite:"https://yoursite.com",// Max 140 charssecurityContact:"security@you.com",// Max 140 charsdetails:"Professional validator"// Max 200 chars}
```

### **Commission Rate Configuration**

The commission rate determines what percentage of staking rewards your validator keeps

| **Value** | **Commission** |
| --- | --- |
| `100` | 0.01% |
| `1000` | 0.1% |
| `10000` | 1% |
| `50000` | 5% |
| `100000` | 10% |

### **Withdrawal Fee Configuration**

The withdrawal fee (in Gwei) is charged when delegators undelegate from your validator.

**Recommended value:** `1` (equivalent to 1 Gneuron, ~1 Gwei)

### **Step 4: Execute Initialization Transaction**

**0G Chain Scan (Recommended)MetaMask / Web3 WalletEthers.js (Programmatic)**

- **0G Chain Scan (Recommended)**
- MetaMask / Web3 Wallet
- Ethers.js (Programmatic)

The easiest way to initialize your validator using the web interface:

1. Navigate to [https://chainscan.0g.ai/address/0xea224dBB52F57752044c0C86aD50930091F561B9](https://chainscan.0g.ai/address/0xea224dBB52F57752044c0C86aD50930091F561B9)
2. Under **Contracts** Tab, click on the **Write As Proxy** button
3. Find and click on `createAndInitializeValidatorIfNecessary`
4. Fill in all the required parameters:
    - **description** (struct):
        - `moniker`: Your validator name (max 70 chars)
        - `identity`: Keybase ID (optional)
        - `website`: Your website URL
        - `securityContact`: Security contact email
        - `details`: Additional description
    - **commissionRate**: Commission percentage (e.g., 10000 for 1%)
    - **withdrawalFeeInGwei**: Withdrawal fee in Gwei (e.g.,1 Gneuron ~ 1 Gwei)
    - **pubkey**: The public key from Step 1
    - **signature**: The signature from Step 1
5. Set the `payable amount` to **500** OG tokens
6. Connect your wallet and execute the transaction

**Tip**

Using the Chain Scan interface requires no coding knowledge and is the safest option for most users.

### **Step 5: Verify Initialization**

After successful initialization, you can verify your validator status:

- Check the transaction on **0G Chain Scan**: [https://chainscan.0g.ai](https://chainscan.0g.ai/)
- Verify your validator status on **0G Explorer**: [https://explorer.0g.ai/mainnet/validators](https://explorer.0g.ai/mainnet/validators)

**Activation Time**

Your validator may initially appear as **inactive** on the explorer. This is normal. Validators typically take **30-60 minutes** to activate on the network after successful initialization.

You can check the transaction status and logs to confirm the initialization was successful while waiting for activation.

### **Troubleshooting**

- **Error: "Insufficient funds"**
- **Error: "Validator already exists"**
- **Error: "Invalid signature"**
- **Error: "Description field too long"**

## **Data Structures**

- **Description Struct**
- **Withdrawal Entry**

## **Configuration Parameters**

| **Parameter** | **Description** |
| --- | --- |
| `maxValidatorCount` | Maximum validators allowed |
| `minActivationStakesInGwei` | Minimum stake for activation |
| `maxEffectiveStakesInGwei` | Maximum effective stake |
| `communityTaxRate` | Tax on all rewards |
| `minWithdrawabilityDelay` | Withdrawal delay blocks |

## **General Troubleshooting**

- **Error: "Validator not found"**
- **Error: "DelegationBelowMinimum"**
- **Error: "NotEnoughWithdrawalFee"**

## **Contract Addresses**

| **Network** | **Staking Contract** |
| --- | --- |
| **Mainnet** | `0xea224dBB52F57752044c0C86aD50930091F561B9` |

## **Resources**

- **Run Validator Node**: [Validator Setup Guide](https://docs.0g.ai/run-a-node/validator-node)
- **GitHub Repository**: [0G Chain Contracts](https://github.com/0gfoundation/0g-chain-v2/blob/dev-v2.1/contracts/src/staking/)
- **Deploy Contracts**: [Contract Deployment](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts)

---

Need help? Join our [Discord](https://discord.gg/0glabs) for developer support.

# **Validator Contract Functions**

Complete function reference for individual validator contracts on 0G Chain.

**Quick Links**

- [**Validator Initialization**](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces#validator-initialization) - Set up a new validator
- [**Staking Interfaces**](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces) - Main staking system overview

## **Function Types**

### **View Functions (Free to Call)**

Query validator state without gas costs.

### **Write Functions (Require Gas)**

Modify validator state - cost gas to execute.

---

## **View Functions**

### **Validator Information**

### **`consensusPubkey()`**

Returns the validator's BLS public key.

**Returns**: 48-byte BLS public key

---

### **`operatorAddress()`**

Returns the validator operator's wallet address.

**Returns**: Operator address

---

### **`description()`**

Returns validator metadata.

**Returns**:

- Moniker (name)
- Identity (verification key)
- Website
- Security contact
- Details

---

### **`commissionRate()`**

Returns current commission rate.

**Returns**: Rate in parts per million (e.g., 100000 = 10%)

---

### **`withdrawalFeeInGwei()`**

Returns fee charged for withdrawals.

**Returns**: Fee in Gwei

---

### **`bondStatus()`**

Returns validator's current status.

**Returns**:

- `Unspecified` - Not activated
- `Bonded` - Active
- `Unbonding` - Exiting
- `Unbonded` - Fully exited

---

### **Delegation Queries**

### **`tokens()`**

Returns total tokens delegated to this validator.

**Returns**: Total tokens in Wei

---

### **`delegatorShares()`**

Returns total shares issued.

**Returns**: Total shares

---

### **`getDelegation(address delegator)`**

Returns delegation info for a specific delegator.

**Parameters**:

- `delegator` - Delegator's address

**Returns**:

- Validator address
- Number of shares owned

---

### **`convertToTokens(uint shares)`**

Converts shares to token amount.

**Parameters**:

- `shares` - Number of shares

**Returns**: Equivalent token amount

**Use Case**: Calculate token value of your shares

---

### **`convertToShares(uint tokens)`**

Converts tokens to shares.

**Parameters**:

- `tokens` - Token amount

**Returns**: Equivalent shares

**Use Case**: Calculate shares you'll receive when delegating

---

### **Rewards & Earnings**

### **`rewards()`**

Returns accumulated rewards pending distribution.

**Returns**: Reward amount in Wei

---

### **`commission()`**

Returns accumulated commission earned by operator.

**Returns**: Commission in Wei

---

### **`tipFee()`**

Returns withdrawable tip fees.

**Returns**: Tip fee amount in Wei

**Calculation**: Contract balance - (commission + rewards + stakes + pending withdrawals)

---

### **`stakes()`**

Returns amount actively staked in beacon chain.

**Returns**: Staked amount in Wei

---

### **`annualPercentageYield()`**

Returns current APY.

**Returns**: APY in basis points (e.g., 1500 = 15%)

---

### **Withdrawal Queue**

### **`withdrawCount()`**

Returns number of pending withdrawals.

**Returns**: Count of pending withdrawals

---

### **`getWithdraw(uint64 index)`**

Returns details of a specific withdrawal.

**Parameters**:

- `index` - Position in queue (0-based)

**Returns**:

- Completion height
- Delegator address
- Amount

---

### **`committedWithdrawAmount(uint blockHeight)`**

Returns total withdrawal amount committed up to a block height.

**Parameters**:

- `blockHeight` - Block number

**Returns**: Total committed amount

---

### **`nextDepositAmount()`**

Returns amount pending deposit to chain.

**Returns**: Pending deposit in Wei

---

### **`nextWithdrawalAmount()`**

Returns amount pending withdrawal from chain.

**Returns**: Pending withdrawal in Wei

---

### **`failedWithdrawCount()`**

Returns count of failed withdrawals.

**Returns**: Number of failed withdrawals

---

### **`failedWithdrawAmount()`**

Returns total amount in failed withdrawals.

**Returns**: Failed withdrawal amount

---

## **Write Functions**

### **Validator Configuration**

### **`setCommissionRate(uint32 commissionRate_)`**

Updates validator commission rate.

**Who Can Call**: Operator only

**Parameters**:

- `commissionRate_` - New rate (parts per million)

**Constraints**: Must be ≤ protocol maximum

---

### **`setWithdrawalFeeInGwei(uint96 withdrawalFeeInGwei_)`**

Updates withdrawal fee.

**Who Can Call**: Operator only

**Parameters**:

- `withdrawalFeeInGwei_` - New fee in Gwei

**Constraints**: Must be ≤ protocol maximum

---

### **`setDescription(Description description_)`**

Updates validator description.

**Who Can Call**: Operator only

**Parameters**:

- `description_` - New description struct

---

### **Delegation Operations**

### **`delegate(address delegatorAddress)`**

Delegate tokens to this validator.

**Who Can Call**: Anyone

**Parameters**:

- `delegatorAddress` - Address to credit with shares

**Payment Required**: Yes (minimum 1 Gwei)

**Example**:

```solidity
validator.delegate{value: 100 ether}(msg.sender);
```

---

### **`undelegate(address withdrawalAddress, uint shares)`**

Undelegate tokens from validator.

**Who Can Call**: Anyone with shares

**Parameters**:

- `withdrawalAddress` - Address to receive tokens
- `shares` - Number of shares to undelegate

**Payment Required**: Yes (must pay withdrawal fee)

**Constraints**:

- Must own enough shares
- Operator must maintain minimum self-delegation
- Tokens released after withdrawal delay

**Example**:

```solidity
uint96 fee = validator.withdrawalFeeInGwei();validator.undelegate{value: fee * 1 gwei}(recipient, shares);
```

---

### **Earnings Management**

### **`withdrawCommission(address withdrawalAddress)`**

Withdraw accumulated commission.

**Who Can Call**: Operator only

**Parameters**:

- `withdrawalAddress` - Address to receive commission

**Constraints**:

- Must have ≥1 Gwei commission
- Goes to withdrawal queue (not instant)

---

### **`withdrawTipFee(address withdrawalAddress)`**

Withdraw accumulated tip fees.

**Who Can Call**: Operator only

**Parameters**:

- `withdrawalAddress` - Address to receive tips

**Constraints**:

- Only withdraws excess balance
- Immediate transfer (not queued)

---

### **System Operations**

### **`distributeRewards()`**

Distribute rewards to delegators and commission to operator.

**Who Can Call**: Anyone (called by system)

**Process**:

1. Community tax deducted
2. Commission calculated
3. Remaining distributed to delegators

---

### **`processWithdrawQueue()`**

Process pending withdrawals that are ready.

**Who Can Call**: Anyone

**When**: After withdrawal delay period

**Process**:

- Checks ready withdrawals
- Transfers funds
- Failed transfers go to failed stack

---

### **`processFailedWithdrawStack()`**

Retry failed withdrawals.

**Who Can Call**: Anyone

**Process**:

- Retries all failed withdrawals
- Still-failed amounts sent to community pool

---

## **Common Use Cases**

### **For Delegators**

**Before Delegating:**

```solidity
// Check validator settingsuint32 commission = validator.commissionRate();uint96 withdrawalFee = validator.withdrawalFeeInGwei();uint bondStatus = validator.bondStatus(); // Should be 1 (Bonded)uint apy = validator.annualPercentageYield();
```

**Delegate Tokens:**

```solidity
validator.delegate{value: amount}(yourAddress);
```

**Check Your Delegation:**

```solidity
(, uint shares) = validator.getDelegation(yourAddress);uint tokens = validator.convertToTokens(shares);
```

**Undelegate:**

```solidity
uint96 fee = validator.withdrawalFeeInGwei();validator.undelegate{value: fee * 1 gwei}(withdrawalAddress, shares);// Wait for withdrawal delay, then call processWithdrawQueue()
```

---

### **For Validator Operators**

**Update Settings:**

```solidity
validator.setCommissionRate(50000); // 5%validator.setWithdrawalFeeInGwei(1); // 1 Gwei
```

**Check Earnings:**

```solidity
uint commissionAmount = validator.commission();uint tipFeeAmount = validator.tipFee();
```

**Withdraw Earnings:**

```solidity
// Withdraw commission (queued)validator.withdrawCommission(yourAddress);// Withdraw tips (immediate)validator.withdrawTipFee(yourAddress);
```

**Monitor Status:**

```solidity
uint totalDelegated = validator.tokens();uint activeStake = validator.stakes();uint pendingWithdrawals = validator.withdrawCount();
```

---

## **Important Notes**

**Key Constraints**

- **Withdrawal Delays**: Undelegations enter a queue with delay period
- **Minimum Amounts**: Most operations require ≥1 Gwei
- **Fee Requirements**: Undelegation requires prepaid withdrawal fee
- **Self-Delegation**: Operators must maintain minimum or lose commission

**Best Practices**

- Always check `bondStatus()` before delegating
- Use `convertToTokens()` to calculate delegation value
- Monitor `failedWithdrawCount()` and process if needed
- Operators should regularly claim commission and tips

---

## **Related Documentation**

- [**Validator Initialization**](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces#validator-initialization) - Set up a new validator
- [**Staking Interfaces**](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces) - Full staking system guide
- [**Run Validator Node**](https://docs.0g.ai/run-a-node/validator-node) - Node setup guide

# **0G Chain Precompiles**

Precompiled contracts that extend 0G Chain with powerful native features for AI and blockchain operations.

## **What Are Precompiles?**

Precompiles are special contracts deployed at fixed addresses that execute native code instead of EVM bytecode. They provide:

- **Gas Efficiency**: 10-100x cheaper than Solidity implementations
- **Native Features**: Access chain-level functionality
- **Complex Operations**: Cryptographic functions and state management

## **0G Chain Precompiles**

Beyond standard Ethereum precompiles, 0G Chain adds specialized contracts for decentralized AI infrastructure:

### **🔐 [DASigners](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-dasigners)**

`0x0000000000000000000000000000000000001000`

Manages data availability signatures for 0G's DA layer.

**Key Features**:

- Register and manage DA node signers
- Query quorum information
- Verify data availability proofs

**Common Use Case**: Building applications that need to verify data availability directly on-chain.

### **🪙 [Wrapped0GBase](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-wrappedogbase)**

`0x0000000000000000000000000000000000001002`

Wrapped version of native 0G token for DeFi compatibility.

**Key Features**:

- Wrap/unwrap native 0G tokens
- ERC20-compatible interface
- Efficient gas operations

**Common Use Case**: Integrating 0G tokens with DEXs, lending protocols, or other DeFi applications.

---

Questions? Get help in our [Discord](https://discord.gg/0glabs) #dev-support channel.

# **Overview**

DAsigners is a wrapper for the `x/dasigners` module in the 0g chain, allowing querying the state of this module from EVM calls.

# **Address**

`0x0000000000000000000000000000000000001000`

# **Interface**

[https://github.com/0gfoundation/0g-chain/blob/dev/precompiles/interfaces/contracts/IDASigners.sol](https://github.com/0gfoundation/0g-chain/blob/dev/precompiles/interfaces/contracts/IDASigners.sol)

## **Structs**

### **`SignerDetail`**

```solidity
struct SignerDetail {    address signer;    string socket;    BN254.G1Point pkG1;    BN254.G2Point pkG2;}
```

- **Description**: Contains details of a signer, including the address, socket, and bn254 public keys (G1 and G2 points).
- **Fields**:
    - `signer`: The address of the signer.
    - `socket`: The socket associated with the signer.
    - `pkG1`: The G1 public key of the signer.
    - `pkG2`: The G2 public key of the signer.

### **`Params`**

```solidity
struct Params {    uint tokensPerVote;    uint maxVotesPerSigner;    uint maxQuorums;    uint epochBlocks;    uint encodedSlices;}
```

- **Description**: Defines parameters for the DAsigners module.
- **Fields**:
    - `tokensPerVote`: The number of tokens required for one vote.
    - `maxVotesPerSigner`: The maximum number of votes a signer can cast.
    - `maxQuorums`: The maximum number of quorums allowed.
    - `epochBlocks`: The number of blocks in an epoch.
    - `encodedSlices`: The number of encoded slices in one DA blob.

---

## **Functions**

### **`params()`**

```solidity
function params() external view returns (Params memory);
```

- **Description**: Retrieves the current parameters of the DAsigners module.
- **Returns**: `Params` structure containing the current module parameters.

---

### **`epochNumber()`**

```solidity
function epochNumber() external view returns (uint);
```

- **Description**: Returns the current epoch number.
- **Returns**: `uint` representing the current epoch number.

---

### **`quorumCount(uint _epoch)`**

```solidity
function quorumCount(uint _epoch) external view returns (uint);
```

- **Description**: Returns the number of quorums for a given epoch.
- **Parameters**:
    - `_epoch`: The epoch number.
- **Returns**: `uint` representing the quorum count for the given epoch.

---

### **`isSigner(address _account)`**

```solidity
function isSigner(address _account) external view returns (bool);
```

- **Description**: Checks if a given account is a registered signer.
- **Parameters**:
    - `_account`: The address to check.
- **Returns**: `bool` indicating whether the account is a signer.

---

### **`getSigner(address[] memory _account)`**

```solidity
function getSigner(    address[] memory _account) external view returns (SignerDetail[] memory);
```

- **Description**: Retrieves details for the signers of the provided addresses.
- **Parameters**:
    - `_account`: An array of addresses to fetch the signer details for.
- **Returns**: An array of `SignerDetail` structures for each signer.

---

### **`getQuorum(uint _epoch, uint _quorumId)`**

```solidity
function getQuorum(    uint _epoch,    uint _quorumId) external view returns (address[] memory);
```

- **Description**: Returns the addresses of the members in a specific quorum for a given epoch.
- **Parameters**:
    - `_epoch`: The epoch number.
    - `_quorumId`: The ID of the quorum.
- **Returns**: An array of addresses that are members of the quorum.

---

### **`getQuorumRow(uint _epoch, uint _quorumId, uint32 _rowIndex)`**

```solidity
function getQuorumRow(    uint _epoch,    uint _quorumId,    uint32 _rowIndex) external view returns (address);
```

- **Description**: Retrieves a specific address from a quorum's row for a given epoch and quorum ID.
- **Parameters**:
    - `_epoch`: The epoch number.
    - `_quorumId`: The quorum ID.
    - `_rowIndex`: The row index within the quorum.
- **Returns**: The address at the specified row index in the quorum.

---

### **`registerSigner(SignerDetail memory _signer, BN254.G1Point memory _signature)`**

```solidity
function registerSigner(    SignerDetail memory _signer,    BN254.G1Point memory _signature) external;
```

- **Description**: Registers a new signer with the provided details and signature.
- **Parameters**:
    - `_signer`: The details of the signer to register.
    - `_signature`: The signature to verify the registration.

---

### **`updateSocket(string memory _socket)`**

```solidity
function updateSocket(string memory _socket) external;
```

- **Description**: Updates the socket used by the module.
- **Parameters**:
    - `_socket`: The new socket address to update.

---

### **`registeredEpoch(address _account, uint _epoch)`**

```solidity
function registeredEpoch(    address _account,    uint _epoch) external view returns (bool);
```

- **Description**: Checks if a specific account is registered in a given epoch.
- **Parameters**:
    - `_account`: The address to check.
    - `_epoch`: The epoch number.
- **Returns**: `bool` indicating whether the account is registered for the specified epoch.

---

### **`registerNextEpoch(BN254.G1Point memory _signature)`**

```solidity
function registerNextEpoch(BN254.G1Point memory _signature) external;
```

- **Description**: Registers the next epoch using the provided signature.
- **Parameters**:
    - `_signature`: The signature used to register the next epoch.

---

### **`getAggPkG1(uint _epoch, uint _quorumId, bytes memory _quorumBitmap)`**

```solidity
function getAggPkG1(    uint _epoch,    uint _quorumId,    bytes memory _quorumBitmap) external view returns (BN254.G1Point memory aggPkG1, uint total, uint hit);
```

- **Description**: Retrieves the aggregated public key for a given epoch and quorum ID.
- **Parameters**:
    - `_epoch`: The epoch number.
    - `_quorumId`: The quorum ID.
    - `_quorumBitmap`: The quorum bitmap.
- **Returns**:
    - `aggPkG1`: The aggregated public key.
    - `total`: The number of rows.
    - `hit`: The number of rows that contributed to the aggregation.

# **Overview**

Wrapped0GBase is a wrapper for the `x/wrapped-og-base` module in the 0g chain. W0G is a wrapped ERC20 token for native 0G. It supports quota-based mint/burn functions based on native 0G transfers, on top of traditional wrapped token implementation. The minting/burning quota for each address will be determined through governance voting. `x/wrapped-og-base` is the module that supports and maintains the minting/burning quota.

In most cases this precompile should be only called by wrapped 0G contract.

# **Address**

`0x0000000000000000000000000000000000001002`

> **Wrapped 0G Token Contract Address**: `0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c`
> 
> 
> This is the official address of the wrapped 0G (W0G) ERC20 token on the 0G chain. Use this address if you want to interact directly with the wrapped 0G token contract for transfers, approvals, or other ERC20 operations.
> 

# **Interface**

[https://github.com/0gfoundation/0g-chain/blob/dev/precompiles/interfaces/contracts/IWrappedA0GIBase.sol](https://github.com/0gfoundation/0g-chain/blob/dev/precompiles/interfaces/contracts/IWrappedA0GIBase.sol)

## **Structs**

### **`Supply`**

```solidity
struct Supply {    uint256 cap;    uint256 initialSupply;    uint256 supply;}
```

- **Description**: Defines the supply details of a minter, including the cap, initial supply, and the current supply.
- **Fields**:
    - `cap`: The maximum allowed mint supply for the minter.
    - `initialSupply`: The initial mint supply to the minter, equivalent to the initial allowed burn amount.
    - `supply`: The current mint supply used by the minter, set to `initialSupply` at beginning.

---

## **Functions**

### **`getWA0GI()`**

```solidity
function getWA0GI() external view returns (address);
```

- **Description**: Retrieves the address of the wrapped 0G token from the wrapped 0G precompile.
- **Returns**: `address` of the W0G contract.

---

### **`minterSupply(address minter)`**

```solidity
function minterSupply(address minter) external view returns (Supply memory);
```

- **Description**: Retrieves the mint supply details for a given minter.
- **Parameters**:
    - `minter`: The address of the minter.
- **Returns**: A `Supply` structure containing the mint cap, initial supply, and current supply of the specified minter.

---

### **`mint(address minter, uint256 amount)`**

```solidity
function mint(address minter, uint256 amount) external;
```

- **Description**: Mints 0G to WA0GI contract and adds the corresponding amount to the minter's mint supply. If the minter's final mint supply exceeds their mint cap, the transaction will revert.
- **Parameters**:
    - `minter`: The address of the minter.
    - `amount`: The amount of 0G to mint.
- **Restrictions**: Can only be called by the WA0GI contract.

---

### **`burn(address minter, uint256 amount)`**

```solidity
function burn(address minter, uint256 amount) external;
```

- **Description**: Burns the specified amount of 0G in WA0GI contract on behalf of the minter and reduces the corresponding amount from the minter's mint supply.
- **Parameters**:
    - `minter`: The address of the minter.
    - `amount`: The amount of 0G to burn.
- **Restrictions**: Can only be called by the W0G contract.

# **Indexing 0G with Goldsky**

Goldsky is Web3's real-time data platform, giving developers the fastest way to query, stream, and scale onchain data without worrying about maintaining infrastructure.

With resilient subgraphs and flexible data streaming pipelines, you can focus on building great user experiences while Goldsky handles the heavy lifting of indexing.

## **Why Goldsky?**

- **Reliable Performance**: Scalable infra built to handle data challenges as your app grows.
- **Intuitive Tools**: Easily integrate without being slowed down by complex data engineering.
- **24/7 Support**: Goldsky offers [support](https://docs.goldsky.com/getting-support) when you need to fix bugs or optimize deployments.

---

## **Goldsky Products**

### **Subgraphs**

**Subgraphs** make blockchain data queryable with GraphQL endpoints so you can easily fetch specifically only the data your app needs.

- **Fast Queries**: Optimized for low latency and high throughput.
- **Customizable**: Tailor indexing logic to your app's exact needs.
- **Organized & Scalable**: Tagging and versioning keep data clean as your project grows.

**Typical Use Cases**: dApps, NFT marketplaces, gaming, DAOs, or any app needing reliable onchain data.

### **Mirror**

**Mirror** streams decoded blockchain data directly into your database so you can own your data and have full control over what to do with it.

- **Realtime Streaming**: Stream onchain activity straight into your existing systems.
- **Combine Data Sources**: Access data across multiple chains and join it with your own offchain data.
- **Continuously Synced**: Automatic updates keep everything accurate and fresh.

**Typical Use Cases**: Advanced analytics, loyalty programs, points/leaderboards, user progress tracking, custom dashboards, or app requiring rich onchain data joined with other datasets.

---

## **Getting Started**

Check out the [Goldsky docs](https://docs.goldsky.com/chains/0g) to start indexing today. Build smarter, scale faster, and deliver seamless experiences to your users.