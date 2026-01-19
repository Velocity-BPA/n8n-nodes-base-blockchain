/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { COMMON_TOKENS, ETH_ADDRESS, ZERO_ADDRESS, DEAD_ADDRESS, L2_ETH_ADDRESS } from '../../nodes/Base/constants/tokens';

describe('Token Constants', () => {
	describe('COMMON_TOKENS', () => {
		it('should have mainnet WETH token', () => {
			expect(COMMON_TOKENS.mainnet.WETH).toBeDefined();
			expect(COMMON_TOKENS.mainnet.WETH.decimals).toBe(18);
			expect(COMMON_TOKENS.mainnet.WETH.symbol).toBe('WETH');
		});

		it('should have mainnet USDC token', () => {
			expect(COMMON_TOKENS.mainnet.USDC).toBeDefined();
			expect(COMMON_TOKENS.mainnet.USDC.decimals).toBe(6);
			expect(COMMON_TOKENS.mainnet.USDC.symbol).toBe('USDC');
		});

		it('should have valid mainnet addresses', () => {
			Object.values(COMMON_TOKENS.mainnet).forEach((token) => {
				expect(token.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
			});
		});

		it('should have valid sepolia addresses', () => {
			Object.values(COMMON_TOKENS.sepolia).forEach((token) => {
				expect(token.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
			});
		});

		it('should have valid decimals', () => {
			Object.values(COMMON_TOKENS.mainnet).forEach((token) => {
				expect(token.decimals).toBeGreaterThanOrEqual(0);
				expect(token.decimals).toBeLessThanOrEqual(18);
			});
		});
	});

	describe('Special Addresses', () => {
		it('should have valid ETH address', () => {
			expect(ETH_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it('should have valid ZERO address', () => {
			expect(ZERO_ADDRESS).toBe('0x0000000000000000000000000000000000000000');
		});

		it('should have valid DEAD address', () => {
			expect(DEAD_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it('should have valid L2 ETH address', () => {
			expect(L2_ETH_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});
	});
});
