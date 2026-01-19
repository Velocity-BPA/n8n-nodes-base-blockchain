/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const COMMON_TOKENS = {
	mainnet: {
		WETH: {
			address: '0x4200000000000000000000000000000000000006',
			symbol: 'WETH',
			name: 'Wrapped Ether',
			decimals: 18,
		},
		USDC: {
			address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
			symbol: 'USDC',
			name: 'USD Coin',
			decimals: 6,
		},
		USDbC: {
			address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
			symbol: 'USDbC',
			name: 'USD Base Coin',
			decimals: 6,
		},
		DAI: {
			address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
			symbol: 'DAI',
			name: 'Dai Stablecoin',
			decimals: 18,
		},
		cbETH: {
			address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
			symbol: 'cbETH',
			name: 'Coinbase Wrapped Staked ETH',
			decimals: 18,
		},
		AERO: {
			address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
			symbol: 'AERO',
			name: 'Aerodrome',
			decimals: 18,
		},
	},
	sepolia: {
		WETH: {
			address: '0x4200000000000000000000000000000000000006',
			symbol: 'WETH',
			name: 'Wrapped Ether',
			decimals: 18,
		},
	},
} as const;

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';

// L2 ETH representation
export const L2_ETH_ADDRESS = '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000';
