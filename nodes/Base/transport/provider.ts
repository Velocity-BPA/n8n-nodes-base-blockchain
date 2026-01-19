/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';
import { NETWORKS } from '../constants/networks';

export interface ProviderCredentials {
	network: string;
	rpcUrl?: string;
	privateKey?: string;
	chainId?: number;
}

export interface ProviderResult {
	provider: ethers.JsonRpcProvider;
	signer: ethers.Wallet | null;
}

/**
 * Get provider and optional signer from credentials
 */
export function getProviderFromCredentials(credentials: ProviderCredentials): ProviderResult {
	const { network, rpcUrl, privateKey, chainId } = credentials;
	
	// Determine RPC URL
	let finalRpcUrl: string;
	if (network === 'custom' && rpcUrl) {
		finalRpcUrl = rpcUrl;
	} else {
		const networkConfig = NETWORKS[network as keyof typeof NETWORKS];
		if (!networkConfig) {
			throw new Error(`Unknown network: ${network}`);
		}
		finalRpcUrl = networkConfig.rpcUrl;
	}
	
	// Create provider
	const provider = new ethers.JsonRpcProvider(finalRpcUrl, chainId);
	
	// Create signer if private key provided
	let signer: ethers.Wallet | null = null;
	if (privateKey) {
		signer = new ethers.Wallet(privateKey, provider);
	}
	
	return { provider, signer };
}

/**
 * Get RPC URL for a network
 */
export function getRpcUrl(network: string, customUrl?: string): string {
	if (network === 'custom' && customUrl) {
		return customUrl;
	}
	
	const networkConfig = NETWORKS[network as keyof typeof NETWORKS];
	if (!networkConfig) {
		throw new Error(`Unknown network: ${network}`);
	}
	
	return networkConfig.rpcUrl;
}

/**
 * Get chain ID for a network
 */
export function getChainId(network: string): number {
	const networkConfig = NETWORKS[network as keyof typeof NETWORKS];
	if (!networkConfig) {
		throw new Error(`Unknown network: ${network}`);
	}
	
	return networkConfig.chainId;
}

/**
 * Simple provider getter from credentials object
 */
export function getProvider(credentials: ProviderCredentials): ethers.JsonRpcProvider {
	const { provider } = getProviderFromCredentials(credentials);
	return provider;
}
