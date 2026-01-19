/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const NETWORKS = {
	mainnet: {
		name: 'Base Mainnet',
		chainId: 8453,
		rpcUrl: 'https://mainnet.base.org',
		explorerUrl: 'https://basescan.org',
		explorerApiUrl: 'https://api.basescan.org/api',
	},
	sepolia: {
		name: 'Base Sepolia',
		chainId: 84532,
		rpcUrl: 'https://sepolia.base.org',
		explorerUrl: 'https://sepolia.basescan.org',
		explorerApiUrl: 'https://api-sepolia.basescan.org/api',
	},
} as const;

export type NetworkName = keyof typeof NETWORKS;

export function getNetworkConfig(network: string) {
	const config = NETWORKS[network as NetworkName];
	if (!config) {
		throw new Error(`Unknown network: ${network}`);
	}
	return config;
}
