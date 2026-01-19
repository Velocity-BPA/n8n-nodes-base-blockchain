/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios from 'axios';
import { NETWORKS } from '../constants/networks';

export interface BasescanClientConfig {
	apiKey: string;
	network: string;
}

export class BasescanClient {
	private apiKey: string;
	private baseUrl: string;

	constructor(config: BasescanClientConfig) {
		this.apiKey = config.apiKey;
		const networkConfig = NETWORKS[config.network as keyof typeof NETWORKS];
		this.baseUrl = networkConfig?.explorerApiUrl || NETWORKS.mainnet.explorerApiUrl;
	}

	private async request(params: Record<string, string>): Promise<unknown> {
		const response = await axios.get(this.baseUrl, {
			params: {
				...params,
				apikey: this.apiKey,
			},
		});

		if (response.data.status === '0' && response.data.message !== 'No transactions found') {
			throw new Error(response.data.result || response.data.message);
		}

		return response.data.result;
	}

	async getBalance(address: string): Promise<string> {
		const result = await this.request({
			module: 'account',
			action: 'balance',
			address,
			tag: 'latest',
		});
		return result as string;
	}

	async getTransactions(address: string, options?: {
		startBlock?: number;
		endBlock?: number;
		page?: number;
		offset?: number;
		sort?: 'asc' | 'desc';
	}): Promise<unknown[]> {
		const result = await this.request({
			module: 'account',
			action: 'txlist',
			address,
			startblock: options?.startBlock?.toString() || '0',
			endblock: options?.endBlock?.toString() || '99999999',
			page: options?.page?.toString() || '1',
			offset: options?.offset?.toString() || '10',
			sort: options?.sort || 'desc',
		});
		return (result as unknown[]) || [];
	}

	async getTokenTransfers(address: string, options?: {
		contractAddress?: string;
		page?: number;
		offset?: number;
		sort?: 'asc' | 'desc';
	}): Promise<unknown[]> {
		const params: Record<string, string> = {
			module: 'account',
			action: 'tokentx',
			address,
			page: options?.page?.toString() || '1',
			offset: options?.offset?.toString() || '10',
			sort: options?.sort || 'desc',
		};

		if (options?.contractAddress) {
			params.contractaddress = options.contractAddress;
		}

		const result = await this.request(params);
		return (result as unknown[]) || [];
	}

	async getNftTransfers(address: string, options?: {
		contractAddress?: string;
		page?: number;
		offset?: number;
		sort?: 'asc' | 'desc';
	}): Promise<unknown[]> {
		const params: Record<string, string> = {
			module: 'account',
			action: 'tokennfttx',
			address,
			page: options?.page?.toString() || '1',
			offset: options?.offset?.toString() || '10',
			sort: options?.sort || 'desc',
		};

		if (options?.contractAddress) {
			params.contractaddress = options.contractAddress;
		}

		const result = await this.request(params);
		return (result as unknown[]) || [];
	}

	async getContractABI(address: string): Promise<string> {
		const result = await this.request({
			module: 'contract',
			action: 'getabi',
			address,
		});
		return result as string;
	}

	async getContractSource(address: string): Promise<unknown> {
		const result = await this.request({
			module: 'contract',
			action: 'getsourcecode',
			address,
		});
		return Array.isArray(result) ? result[0] : result;
	}

	async getGasOracle(): Promise<{
		SafeGasPrice: string;
		ProposeGasPrice: string;
		FastGasPrice: string;
	}> {
		const result = await this.request({
			module: 'gastracker',
			action: 'gasoracle',
		});
		return result as {
			SafeGasPrice: string;
			ProposeGasPrice: string;
			FastGasPrice: string;
		};
	}

	async getBlockByTimestamp(timestamp: number, closest: 'before' | 'after' = 'before'): Promise<string> {
		const result = await this.request({
			module: 'block',
			action: 'getblocknobytime',
			timestamp: timestamp.toString(),
			closest,
		});
		return result as string;
	}
}

/**
 * Create Basescan client from credentials
 */
export function getBasescanClient(config: BasescanClientConfig): BasescanClient {
	return new BasescanClient(config);
}
