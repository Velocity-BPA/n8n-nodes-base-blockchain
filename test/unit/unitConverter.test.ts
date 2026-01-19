/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	weiToEther,
	etherToWei,
	gweiToWei,
	weiToGwei,
	formatUnits,
	parseUnits,
	isValidAddress,
	isValidTxHash,
	shortenAddress,
} from '../../nodes/Base/utils/unitConverter';

describe('Unit Converter Utilities', () => {
	describe('weiToEther', () => {
		it('should convert wei to ether correctly', () => {
			expect(weiToEther('1000000000000000000')).toBe('1.0');
			expect(weiToEther('500000000000000000')).toBe('0.5');
			expect(weiToEther('0')).toBe('0.0');
		});

		it('should handle large values', () => {
			expect(weiToEther('100000000000000000000')).toBe('100.0');
		});
	});

	describe('etherToWei', () => {
		it('should convert ether to wei correctly', () => {
			expect(etherToWei('1').toString()).toBe('1000000000000000000');
			expect(etherToWei('0.5').toString()).toBe('500000000000000000');
			expect(etherToWei('0').toString()).toBe('0');
		});

		it('should handle decimal values', () => {
			expect(etherToWei('0.001').toString()).toBe('1000000000000000');
		});
	});

	describe('gweiToWei', () => {
		it('should convert gwei to wei correctly', () => {
			expect(gweiToWei('1').toString()).toBe('1000000000');
			expect(gweiToWei('10').toString()).toBe('10000000000');
		});
	});

	describe('weiToGwei', () => {
		it('should convert wei to gwei correctly', () => {
			expect(weiToGwei('1000000000')).toBe('1.0');
			expect(weiToGwei('10000000000')).toBe('10.0');
		});
	});

	describe('formatUnits', () => {
		it('should format token amounts with correct decimals', () => {
			expect(formatUnits('1000000', 6)).toBe('1.0');
			expect(formatUnits('1000000000000000000', 18)).toBe('1.0');
		});

		it('should handle zero', () => {
			expect(formatUnits('0', 18)).toBe('0.0');
		});
	});

	describe('parseUnits', () => {
		it('should parse token amounts to smallest unit', () => {
			expect(parseUnits('1', 6).toString()).toBe('1000000');
			expect(parseUnits('1', 18).toString()).toBe('1000000000000000000');
		});
	});

	describe('isValidAddress', () => {
		it('should validate correct addresses', () => {
			expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true);
			expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(true);
		});

		it('should reject invalid addresses', () => {
			expect(isValidAddress('0x123')).toBe(false);
			expect(isValidAddress('not an address')).toBe(false);
			expect(isValidAddress('')).toBe(false);
		});
	});

	describe('isValidTxHash', () => {
		it('should validate correct transaction hashes', () => {
			expect(isValidTxHash('0x' + 'a'.repeat(64))).toBe(true);
			expect(isValidTxHash('0x' + '0'.repeat(64))).toBe(true);
		});

		it('should reject invalid transaction hashes', () => {
			expect(isValidTxHash('0x123')).toBe(false);
			expect(isValidTxHash('not a hash')).toBe(false);
		});
	});

	describe('shortenAddress', () => {
		it('should shorten valid addresses', () => {
			const address = '0x0000000000000000000000000000000000000000';
			expect(shortenAddress(address)).toBe('0x0000...0000');
		});

		it('should return original for invalid addresses', () => {
			expect(shortenAddress('invalid')).toBe('invalid');
		});
	});
});
