# n8n-nodes-base-blockchain

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

---

A comprehensive n8n community node for the Base blockchain (Coinbase's L2 network). This marketplace-ready toolkit provides complete Base network integration with 17 resource categories, 100+ operations, and real-time event monitoring through triggers.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Base](https://img.shields.io/badge/Base-L2-0052FF)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Complete Base L2 Integration** - Full support for transactions, tokens, NFTs, and smart contracts
- **OP Stack Bridging** - L1↔L2 deposits and withdrawals with challenge period tracking
- **Basenames (ENS on Base)** - Name resolution, availability checking, and record management
- **EAS Attestations** - Create, verify, and revoke on-chain attestations
- **Coinbase Ecosystem** - Smart wallet support, OnchainKit integration
- **DeFi Operations** - Uniswap V3 swaps, quotes, and pool information
- **Farcaster Integration** - Cast retrieval, user data, and frame validation
- **Safe Multisig** - Full multisig transaction management
- **Real-time Triggers** - Monitor blocks, transactions, transfers, and events

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter: `n8n-nodes-base-blockchain`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n nodes directory
cd ~/.n8n/nodes

# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-base-blockchain.git

# Install and build
cd n8n-nodes-base-blockchain
npm install
npm run build

# Restart n8n
n8n start
```

### Development Installation

```bash
# Extract and setup
unzip n8n-nodes-base-blockchain.zip
cd n8n-nodes-base-blockchain

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/nodes
ln -s $(pwd) ~/.n8n/nodes/n8n-nodes-base-blockchain

# Restart n8n
n8n start
```

## Credentials Setup

### Base Network Credentials (Required)

| Field | Description | Default |
|-------|-------------|---------|
| Network | Select `mainnet` or `sepolia` | mainnet |
| RPC URL | Custom RPC endpoint | Network default |
| Private Key | For write operations | - |
| Chain ID | Auto-populated | 8453 / 84532 |

### Basescan API Credentials (Optional)

| Field | Description |
|-------|-------------|
| API Key | Get from [basescan.org/apis](https://basescan.org/apis) |

### Coinbase Cloud Credentials (Optional)

| Field | Description |
|-------|-------------|
| Project ID | From Coinbase Cloud dashboard |
| API Key | API key for authentication |
| API Secret | API secret for signing |

## Resources & Operations

| Resource | Operations | Description |
|----------|------------|-------------|
| **Account** | 8 operations | Balance, transaction history, token transfers, NFT holdings |
| **Transaction** | 12 operations | Send ETH, get receipts, estimate gas, decode input |
| **Token** | 7 operations | ERC-20 operations (transfer, approve, balance, allowance) |
| **NFT** | 10 operations | ERC-721/1155 operations (transfer, metadata, ownership) |
| **Contract** | 10 operations | Deploy, read, write, ABI operations, multicall |
| **Bridge** | 7 operations | L1↔L2 deposits/withdrawals with OP Stack |
| **Block** | 6 operations | Get blocks, transactions, finality status |
| **Events** | 4 operations | Filtered logs, event decoding, Transfer events |
| **OnchainKit** | 6 operations | Basename resolution, identity, frame metadata |
| **Basename** | 6 operations | ENS on Base (resolve, records, availability) |
| **Attestation** | 6 operations | EAS integration (create, verify, revoke) |
| **Coinbase Wallet** | 4 operations | Smart wallet info and prediction |
| **DEX** | 4 operations | Uniswap V3 swaps, quotes, pool info, prices |
| **Farcaster** | 8 operations | Cast info, user data, frame validation |
| **Safe** | 10 operations | Multisig operations (propose, sign, execute) |
| **Fee** | 7 operations | Gas oracle, L1 data fee calculation |
| **Utility** | 10 operations | ABI encoding, hashing, signing, unit conversion |

## Trigger Node

Real-time event monitoring for:

- **New Blocks** - Monitor new block creation
- **Transactions** - Track specific address transactions
- **ETH Transfers** - Monitor ETH movement
- **Token Transfers** - ERC-20 transfer events
- **NFT Activity** - ERC-721/1155 transfers
- **Contract Events** - Custom event monitoring
- **Bridge Operations** - L1/L2 bridge activity
- **Basename Registrations** - New name registrations
- **Attestation Events** - New attestations and revocations

## Usage Examples

### Get ETH Balance

```
Resource: Account
Operation: Get ETH Balance
Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f8fE5c
```

### Send ETH Transaction

```
Resource: Transaction
Operation: Send ETH
To: 0x742d35Cc6634C0532925a3b844Bc9e7595f8fE5c
Amount: 0.01
```

### Bridge ETH to Base

```
Resource: Bridge
Operation: Deposit ETH
Amount: 0.1
L1 RPC URL: https://mainnet.infura.io/v3/YOUR_KEY
```

### Resolve Basename

```
Resource: Basename
Operation: Resolve Name
Name: vitalik.base
```

### Create Attestation

```
Resource: Attestation
Operation: Create Attestation
Schema UID: 0x...
Recipient: 0x...
Data: {"verified": true}
```

### Get DEX Swap Quote

```
Resource: DEX
Operation: Get Swap Quote
Token In: 0x4200000000000000000000000000000000000006 (WETH)
Token Out: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (USDC)
Amount In: 1
```

## Base Blockchain Concepts

### OP Stack Architecture

Base is built on Optimism's OP Stack, a modular rollup framework. Transactions are executed on L2 and periodically settled to Ethereum L1, providing lower costs with L1 security.

### L1 Data Fee

Every Base transaction includes an L1 data fee for posting calldata to Ethereum. This fee varies with L1 gas prices and is calculated using EIP-4844 blob pricing.

### Withdrawal Delay

Withdrawals from Base to Ethereum have a **7-day challenge period** for security. The bridge operations track withdrawal status through:
1. Initiate withdrawal on L2
2. Wait for L2 output root
3. Prove withdrawal on L1
4. Wait 7-day challenge period
5. Finalize withdrawal on L1

### Basenames

ENS-compatible naming system native to Base. Names end in `.base` and resolve to addresses, with support for text records, avatars, and other metadata.

### EAS (Ethereum Attestation Service)

On-chain attestation system for verifiable credentials. Create, verify, and revoke attestations using standard schemas. Useful for identity, reputation, and credential verification.

## Networks

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Mainnet | 8453 | https://mainnet.base.org | https://basescan.org |
| Sepolia | 84532 | https://sepolia.base.org | https://sepolia.basescan.org |

## Error Handling

The node provides detailed error messages for common scenarios:

- **Insufficient funds** - Check balance before transactions
- **Gas estimation failed** - Contract may revert or require higher gas
- **Nonce too low** - Transaction already processed
- **RPC errors** - Network or endpoint issues
- **Invalid address** - Malformed Ethereum address
- **Contract revert** - Smart contract execution failed

## Security Best Practices

- **Never log or expose private keys** in workflows
- **Validate all addresses** before transactions
- **Handle bridge challenge periods** appropriately (7 days)
- **Verify attestation schemas** before trusting
- **Check token approvals** before transfers
- **Use secure RPC endpoints** (avoid public endpoints for production)
- **Test on Sepolia** before mainnet deployment

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode for development
npm run dev

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Format code
npm run format
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Passes all tests (`npm test`)
- Follows the linting rules (`npm run lint`)
- Includes appropriate documentation

## Support

- **GitHub Issues**: [Report a bug](https://github.com/Velocity-BPA/n8n-nodes-base-blockchain/issues)
- **Website**: [velobpa.com](https://velobpa.com)
- **Licensing**: [licensing@velobpa.com](mailto:licensing@velobpa.com)

## Acknowledgments

- [Base](https://base.org) - Coinbase's L2 blockchain
- [n8n](https://n8n.io) - Workflow automation platform
- [Optimism](https://optimism.io) - OP Stack technology
- [Ethereum Attestation Service](https://attest.sh) - On-chain attestations
- [Uniswap](https://uniswap.org) - DEX protocol

---

Built with ❤️ by [Velocity BPA](https://velobpa.com)
