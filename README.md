# n8n-nodes-base-blockchain

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for blockchain operations, providing access to 6 core resources including blocks, transactions, accounts, contracts, tokens, and networks. This node enables seamless integration with blockchain networks for querying data, monitoring transactions, managing smart contracts, and automating blockchain-based workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Blockchain](https://img.shields.io/badge/blockchain-enabled-orange)
![Web3](https://img.shields.io/badge/Web3-compatible-green)
![DeFi](https://img.shields.io/badge/DeFi-ready-purple)

## Features

- **Block Operations** - Query block data, retrieve block headers, and monitor blockchain height
- **Transaction Management** - Send transactions, query transaction status, and retrieve transaction history
- **Account Operations** - Check balances, manage addresses, and monitor account activity
- **Smart Contract Integration** - Deploy contracts, call contract methods, and monitor contract events
- **Token Operations** - Transfer tokens, query token balances, and manage token metadata
- **Network Management** - Switch networks, check network status, and retrieve network information
- **Real-time Monitoring** - Monitor blockchain events and transaction confirmations
- **Multi-chain Support** - Compatible with various blockchain networks and protocols

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
| API Key | Your blockchain API key for authentication | Yes |
| Network URL | RPC endpoint URL for the blockchain network | Yes |
| Chain ID | Numeric identifier for the blockchain network | No |
| Timeout | Request timeout in milliseconds (default: 30000) | No |

## Resources & Operations

### 1. Block

| Operation | Description |
|-----------|-------------|
| Get | Retrieve block information by block number or hash |
| Get Latest | Get the most recent block data |
| Get Range | Retrieve multiple blocks within a specified range |
| Get Header | Get block header information only |
| Get Transactions | List all transactions in a specific block |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Send | Broadcast a new transaction to the blockchain |
| Get | Retrieve transaction details by transaction hash |
| Get Receipt | Get transaction receipt and execution status |
| Get History | Retrieve transaction history for an address |
| Estimate Gas | Calculate gas requirements for a transaction |
| Get Pending | List pending transactions in the mempool |

### 3. Account

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve account balance for native currency |
| Get Nonce | Get the next nonce value for an account |
| Get Info | Retrieve comprehensive account information |
| Create | Generate a new blockchain account/address |
| Import | Import an existing account using private key |
| List | List all accounts in the wallet |

### 4. Contract

| Operation | Description |
|-----------|-------------|
| Deploy | Deploy a new smart contract to the blockchain |
| Call | Execute a read-only contract method |
| Send | Execute a state-changing contract method |
| Get Code | Retrieve contract bytecode |
| Get ABI | Get contract Application Binary Interface |
| Listen Events | Monitor contract events and logs |

### 5. Token

| Operation | Description |
|-----------|-------------|
| Transfer | Send tokens between addresses |
| Get Balance | Check token balance for an address |
| Get Info | Retrieve token metadata and information |
| Approve | Approve token spending allowance |
| Get Allowance | Check approved spending allowance |
| Get Supply | Get total token supply information |

### 6. Network

| Operation | Description |
|-----------|-------------|
| Get Info | Retrieve network status and information |
| Switch | Change active blockchain network |
| Get Gas Price | Get current gas price recommendations |
| Get Peers | List connected network peers |
| Get Sync Status | Check blockchain synchronization status |
| Get Version | Get network client version information |

## Usage Examples

```javascript
// Get latest block information
{
  "resource": "block",
  "operation": "getLatest",
  "includeTransactions": true
}
```

```javascript
// Send a transaction
{
  "resource": "transaction",
  "operation": "send",
  "to": "0x742d35Cc6634C0532925a3b8D39d8A7B9B2E5d4A",
  "value": "1000000000000000000",
  "gasLimit": "21000"
}
```

```javascript
// Check token balance
{
  "resource": "token",
  "operation": "getBalance",
  "contractAddress": "0xA0b86a33E6441b38A0b7c8dd4f87C5b0b8dCd82B",
  "address": "0x742d35Cc6634C0532925a3b8D39d8A7B9B2E5d4A"
}
```

```javascript
// Call smart contract method
{
  "resource": "contract",
  "operation": "call",
  "contractAddress": "0xA0b86a33E6441b38A0b7c8dd4f87C5b0b8dCd82B",
  "method": "balanceOf",
  "parameters": ["0x742d35Cc6634C0532925a3b8D39d8A7B9B2E5d4A"]
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has necessary permissions |
| Insufficient Gas | Transaction gas limit too low for execution | Increase gas limit or use gas estimation |
| Network Timeout | Request exceeded timeout duration | Check network connectivity or increase timeout value |
| Invalid Address | Blockchain address format is incorrect | Validate address format for the specific network |
| Insufficient Balance | Account lacks funds for transaction | Ensure account has adequate balance including gas fees |
| Contract Not Found | Smart contract does not exist at specified address | Verify contract address and deployment status |

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
- **Web3 Documentation**: [Web3.js Docs](https://web3js.readthedocs.io/)
- **Ethereum API Reference**: [Ethereum JSON-RPC](https://ethereum.org/en/developers/docs/apis/json-rpc/)