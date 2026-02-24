# n8n-nodes-base-blockchain

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node that provides comprehensive access to Base blockchain data through 7 powerful resources. Interact with accounts, transactions, tokens, smart contracts, blocks, network statistics, and logs to build sophisticated blockchain automation workflows on Coinbase's Layer 2 network.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Base Network](https://img.shields.io/badge/Base-Blockchain-0052FF)
![Layer 2](https://img.shields.io/badge/Layer%202-Ethereum-627EEA)
![Coinbase](https://img.shields.io/badge/Coinbase-Powered-1652F0)

## Features

- **Multi-Resource Support** - Access accounts, transactions, tokens, contracts, blocks, stats, and logs in one unified node
- **Real-Time Data** - Query live blockchain data with up-to-date information from the Base network
- **Smart Contract Integration** - Read contract data, decode function calls, and monitor contract events
- **Transaction Analysis** - Retrieve detailed transaction information including gas usage, status, and trace data
- **Token Operations** - Get token balances, transfers, metadata, and holder information for ERC-20 and ERC-721 tokens
- **Block Explorer Functions** - Access complete block data, transaction lists, and network statistics
- **Event Monitoring** - Query and filter blockchain logs for specific events and contract interactions
- **Flexible Authentication** - Secure API key-based access with rate limiting support

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-base-blockchain`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-base-blockchain
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-base-blockchain.git
cd n8n-nodes-base-blockchain
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-base-blockchain
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Base blockchain API key from supported providers (Alchemy, QuickNode, etc.) | Yes |
| Base URL | Custom API endpoint URL (if using self-hosted node) | No |
| Rate Limit | Maximum requests per second (default: 5) | No |
| Timeout | Request timeout in milliseconds (default: 30000) | No |

## Resources & Operations

### 1. Accounts

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve ETH balance for a specific address |
| Get Transaction Count | Get the nonce (transaction count) for an address |
| Get Code | Retrieve smart contract bytecode for a contract address |
| Get Storage | Get storage value at a specific position for a contract |
| List Transactions | Get transaction history for an address |
| Get Token Balances | Retrieve all token balances for an address |

### 2. Transactions

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve detailed transaction information by hash |
| Get Receipt | Get transaction receipt with logs and status |
| Get Trace | Get detailed trace information for a transaction |
| Send Raw Transaction | Broadcast a signed raw transaction |
| Estimate Gas | Estimate gas cost for a transaction |
| Get Pending | List pending transactions in the mempool |

### 3. Tokens

| Operation | Description |
|-----------|-------------|
| Get Token Info | Retrieve token metadata (name, symbol, decimals) |
| Get Balance | Get token balance for a specific address |
| Get Transfers | List token transfer events |
| Get Holders | Get list of token holders |
| Get Total Supply | Retrieve total token supply |
| Get Allowances | Get token spending allowances |

### 4. Contracts

| Operation | Description |
|-----------|-------------|
| Call Function | Execute a read-only contract function call |
| Get ABI | Retrieve contract ABI if available |
| Get Events | Get contract events and logs |
| Verify Contract | Check contract verification status |
| Get Source Code | Retrieve verified contract source code |
| Decode Input | Decode transaction input data |

### 5. Blocks

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block information by number or hash |
| Get Latest Block | Get the most recent block |
| Get Block Range | Retrieve multiple blocks in a range |
| Get Uncle Blocks | Get uncle blocks for a specific block |
| Get Block Transactions | List all transactions in a block |
| Get Block Receipts | Get all transaction receipts for a block |

### 6. Stats

| Operation | Description |
|-----------|-------------|
| Get Network Stats | Retrieve current network statistics |
| Get Gas Price | Get current recommended gas prices |
| Get TPS | Get current transactions per second |
| Get Node Info | Get blockchain node information |
| Get Chain ID | Retrieve the Base network chain ID |
| Get Block Time | Get average block time statistics |

### 7. Logs

| Operation | Description |
|-----------|-------------|
| Get Logs | Query blockchain logs with filters |
| Get Event Logs | Get logs for specific contract events |
| Filter Logs | Apply complex filters to log queries |
| Decode Logs | Decode log data using ABI |
| Get Log Range | Retrieve logs within a block range |
| Subscribe to Logs | Set up log monitoring (webhook-based) |

## Usage Examples

### Get Account Balance
```javascript
// Get ETH balance for an address
{
  "resource": "accounts",
  "operation": "getBalance",
  "address": "0x742C3cF9Af45f91B109a81EfEaf11535ECDe9571",
  "blockTag": "latest"
}
```

### Monitor Token Transfers
```javascript
// Get recent USDC transfers
{
  "resource": "tokens",
  "operation": "getTransfers",
  "contractAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "fromBlock": "latest-1000",
  "toBlock": "latest"
}
```

### Call Smart Contract Function
```javascript
// Read data from a contract
{
  "resource": "contracts",
  "operation": "callFunction",
  "contractAddress": "0x4200000000000000000000000000000000000006",
  "functionName": "balanceOf",
  "parameters": ["0x742C3cF9Af45f91B109a81EfEaf11535ECDe9571"]
}
```

### Get Block Information
```javascript
// Retrieve latest block details
{
  "resource": "blocks",
  "operation": "getLatestBlock",
  "includeTransactions": true,
  "includeReceipts": false
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided API key | Verify API key is correct and has proper permissions |
| Rate Limit Exceeded | Too many requests sent in short period | Reduce request frequency or upgrade API plan |
| Invalid Address | Provided address is not a valid Ethereum address | Check address format and ensure it's properly checksummed |
| Block Not Found | Requested block number or hash doesn't exist | Verify block exists and hasn't been reorganized |
| Contract Not Found | Contract address doesn't contain deployed code | Ensure address is correct and contract is deployed |
| Network Error | Connection timeout or network unavailable | Check internet connection and API endpoint status |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-base-blockchain/issues)
- **Base Documentation**: [Base Developer Docs](https://docs.base.org/)
- **Base Discord**: [Base Community](https://discord.gg/buildonbase)