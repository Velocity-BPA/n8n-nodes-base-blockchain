/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { NETWORKS, getNetworkConfig } from '../../nodes/Base/constants/networks';

describe('Network Constants', () => {
	describe('NETWORKS', () => {
		it('should have mainnet configuration', () => {
			expect(NETWORKS.mainnet).toBeDefined();
			expect(NETWORKS.mainnet.chainId).toBe(8453);
			expect(NETWORKS.mainnet.name).toBe('Base Mainnet');
		});

		it('should have sepolia configuration', () => {
			expect(NETWORKS.sepolia).toBeDefined();
			expect(NETWORKS.sepolia.chainId).toBe(84532);
			expect(NETWORKS.sepolia.name).toBe('Base Sepolia');
		});

		it('should have valid RPC URLs', () => {
			expect(NETWORKS.mainnet.rpcUrl).toContain('https://');
			expect(NETWORKS.sepolia.rpcUrl).toContain('https://');
		});

		it('should have valid explorer URLs', () => {
			expect(NETWORKS.mainnet.explorerUrl).toContain('basescan.org');
			expect(NETWORKS.sepolia.explorerUrl).toContain('basescan.org');
		});
	});

	describe('getNetworkConfig', () => {
		it('should return mainnet config', () => {
			const config = getNetworkConfig('mainnet');
			expect(config.chainId).toBe(8453);
		});

		it('should return sepolia config', () => {
			const config = getNetworkConfig('sepolia');
			expect(config.chainId).toBe(84532);
		});

		it('should throw for invalid network', () => {
			expect(() => getNetworkConfig('invalid' as any)).toThrow();
		});
	});
});
