/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';
import { GAS_PRICE_ORACLE_ABI, BASE_CONTRACTS } from '../constants/contracts';

/**
 * Get the Gas Price Oracle contract
 */
export function getGasPriceOracle(provider: ethers.Provider, network: string = 'mainnet') {
	const contracts = BASE_CONTRACTS[network as keyof typeof BASE_CONTRACTS] || BASE_CONTRACTS.mainnet;
	return new ethers.Contract(contracts.gasPriceOracle, GAS_PRICE_ORACLE_ABI, provider);
}

/**
 * Estimate L1 data fee for a transaction
 */
export async function estimateL1DataFee(
	provider: ethers.Provider,
	txData: string,
	network: string = 'mainnet'
): Promise<bigint> {
	const oracle = getGasPriceOracle(provider, network);
	try {
		const l1Fee = await oracle.getL1Fee(txData);
		return l1Fee;
	} catch {
		// Fallback estimation
		return 0n;
	}
}

/**
 * Estimate total fee for a transaction (L1 + L2)
 */
export async function estimateTotalFee(
	provider: ethers.Provider,
	txData: string,
	gasLimit: bigint
): Promise<{
	l1DataFee: bigint;
	l2ExecutionFee: bigint;
	totalFee: bigint;
}> {
	const feeData = await provider.getFeeData();
	const l1DataFee = await estimateL1DataFee(provider, txData);
	const l2ExecutionFee = gasLimit * (feeData.gasPrice || 0n);
	
	return {
		l1DataFee,
		l2ExecutionFee,
		totalFee: l1DataFee + l2ExecutionFee,
	};
}

/**
 * Get current gas prices
 */
export async function getGasPrices(provider: ethers.Provider): Promise<{
	gasPrice: string;
	maxFeePerGas: string | null;
	maxPriorityFeePerGas: string | null;
}> {
	const feeData = await provider.getFeeData();
	
	return {
		gasPrice: feeData.gasPrice?.toString() || '0',
		maxFeePerGas: feeData.maxFeePerGas?.toString() || null,
		maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || null,
	};
}

/**
 * Get L1 base fee
 */
export async function getL1BaseFee(
	provider: ethers.Provider,
	network: string = 'mainnet'
): Promise<bigint> {
	const oracle = getGasPriceOracle(provider, network);
	try {
		return await oracle.l1BaseFee();
	} catch {
		return 0n;
	}
}
