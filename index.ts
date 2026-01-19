/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * n8n-nodes-base-blockchain - Base Blockchain Community Node
 *
 * A complete toolkit for Base L2 network interactions including:
 * - Account management and balance queries
 * - Transaction sending and monitoring
 * - ERC-20 token operations
 * - ERC-721/1155 NFT operations
 * - Smart contract deployment and interaction
 * - L1↔L2 bridging via OP Stack
 * - Block and event queries
 * - Basenames (ENS on Base)
 * - EAS Attestations
 * - Coinbase ecosystem integrations
 * - DEX operations (Uniswap V3, Aerodrome)
 * - Safe multisig operations
 * - Farcaster frame support
 *
 * @author Velocity BPA
 * @website https://velobpa.com
 * @repository https://github.com/Velocity-BPA/n8n-nodes-base-blockchain
 * @license BUSL-1.1
 */

// Emit licensing notice once at module load
console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);

// Export the main nodes
export { Base } from './nodes/Base/Base.node';
export { BaseTrigger } from './nodes/Base/BaseTrigger.node';

// Export credentials
export { BaseNetwork } from './credentials/BaseNetwork.credentials';
export { Basescan } from './credentials/Basescan.credentials';
export { CoinbaseCloud } from './credentials/CoinbaseCloud.credentials';
