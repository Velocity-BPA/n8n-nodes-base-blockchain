/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';

/**
 * Check if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
	try {
		return ethers.isAddress(address);
	} catch {
		return false;
	}
}

/**
 * Get checksummed address
 */
export function checksumAddress(address: string): string {
	return ethers.getAddress(address);
}

/**
 * Convert Wei to Ether
 */
export function weiToEther(wei: string | bigint): string {
	return ethers.formatEther(wei);
}

/**
 * Convert Ether to Wei
 */
export function etherToWei(ether: string | number): bigint {
	return ethers.parseEther(ether.toString());
}

/**
 * Convert Wei to Gwei
 */
export function weiToGwei(wei: string | bigint): string {
	return ethers.formatUnits(wei, 'gwei');
}

/**
 * Convert Gwei to Wei
 */
export function gweiToWei(gwei: string | number): bigint {
	return ethers.parseUnits(gwei.toString(), 'gwei');
}

/**
 * Convert units with custom decimals
 */
export function formatUnits(value: string | bigint, decimals: number): string {
	return ethers.formatUnits(value, decimals);
}

/**
 * Parse units with custom decimals
 */
export function parseUnits(value: string | number, decimals: number): bigint {
	return ethers.parseUnits(value.toString(), decimals);
}

/**
 * Check if a string is a valid transaction hash
 */
export function isValidTxHash(hash: string): boolean {
	return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Check if a string is a valid bytes32
 */
export function isValidBytes32(bytes: string): boolean {
	return /^0x[a-fA-F0-9]{64}$/.test(bytes);
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars = 4): string {
	if (!isValidAddress(address)) return address;
	return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Convert hex string to number
 */
export function hexToNumber(hex: string): number {
	return parseInt(hex, 16);
}

/**
 * Convert number to hex string
 */
export function numberToHex(num: number): string {
	return `0x${num.toString(16)}`;
}
