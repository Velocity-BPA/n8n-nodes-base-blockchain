/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { getProviderFromCredentials } from '../../transport/provider';
import { getBasescanClient } from '../../transport/explorerApi';
import { isValidAddress, checksumAddress, weiToEther } from '../../utils/unitConverter';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Get ETH Balance',
				value: 'getBalance',
				description: 'Get ETH balance of an address',
				action: 'Get ETH balance',
			},
			{
				name: 'Get Token Balance',
				value: 'getTokenBalance',
				description: 'Get ERC-20 token balance',
				action: 'Get token balance',
			},
			{
				name: 'Get Transactions',
				value: 'getTransactions',
				description: 'Get transaction history',
				action: 'Get transactions',
			},
			{
				name: 'Get Token Transfers',
				value: 'getTokenTransfers',
				description: 'Get ERC-20 token transfer history',
				action: 'Get token transfers',
			},
			{
				name: 'Get NFT Holdings',
				value: 'getNftHoldings',
				description: 'Get NFT holdings for an address',
				action: 'Get NFT holdings',
			},
			{
				name: 'Get Nonce',
				value: 'getNonce',
				description: 'Get account nonce',
				action: 'Get nonce',
			},
			{
				name: 'Is Contract',
				value: 'isContract',
				description: 'Check if address is a contract',
				action: 'Is contract',
			},
			{
				name: 'Get Code',
				value: 'getCode',
				description: 'Get bytecode at address',
				action: 'Get code',
			},
		],
		default: 'getBalance',
	},
];

export const accountFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Ethereum address',
	},
	{
		displayName: 'Token Address',
		name: 'tokenAddress',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getTokenBalance', 'getTokenTransfers'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'ERC-20 token contract address',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getTransactions', 'getTokenTransfers', 'getNftHoldings'],
			},
		},
		default: 1,
		description: 'Page number for pagination',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getTransactions', 'getTokenTransfers', 'getNftHoldings'],
			},
		},
		default: 10,
		description: 'Number of results per page',
	},
];

export async function executeAccountOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('baseNetwork');
	const address = this.getNodeParameter('address', index) as string;

	if (!isValidAddress(address)) {
		throw new Error(`Invalid address: ${address}`);
	}

	const { provider } = getProviderFromCredentials({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string | undefined,
		privateKey: credentials.privateKey as string | undefined,
		chainId: credentials.chainId as number | undefined,
	});

	let result: IDataObject;

	switch (operation) {
		case 'getBalance': {
			const balance = await provider.getBalance(address);
			result = {
				address: checksumAddress(address),
				balanceWei: balance.toString(),
				balanceEth: weiToEther(balance),
			};
			break;
		}

		case 'getTokenBalance': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			if (!isValidAddress(tokenAddress)) {
				throw new Error(`Invalid token address: ${tokenAddress}`);
			}

			const tokenAbi = [
				'function balanceOf(address) view returns (uint256)',
				'function decimals() view returns (uint8)',
				'function symbol() view returns (string)',
				'function name() view returns (string)',
			];

			const token = new ethers.Contract(tokenAddress, tokenAbi, provider);
			const [balance, decimals, symbol, name] = await Promise.all([
				token.balanceOf(address),
				token.decimals(),
				token.symbol(),
				token.name(),
			]);

			result = {
				address: checksumAddress(address),
				tokenAddress: checksumAddress(tokenAddress),
				tokenName: name,
				tokenSymbol: symbol,
				balance: balance.toString(),
				formattedBalance: ethers.formatUnits(balance, decimals),
				decimals,
			};
			break;
		}

		case 'getTransactions': {
			const page = this.getNodeParameter('page', index, 1) as number;
			const limit = this.getNodeParameter('limit', index, 10) as number;

			try {
				const basescanCredentials = await this.getCredentials('basescan');
				const basescan = getBasescanClient({
					apiKey: basescanCredentials.apiKey as string,
					network: credentials.network as string,
				});

				const transactions = await basescan.getTransactions(address, {
					page,
					offset: limit,
				});

				result = {
					address: checksumAddress(address),
					transactions,
					count: Array.isArray(transactions) ? transactions.length : 0,
				};
			} catch {
				result = {
					address: checksumAddress(address),
					transactions: [],
					count: 0,
					note: 'Basescan API credentials required for transaction history',
				};
			}
			break;
		}

		case 'getTokenTransfers': {
			const page = this.getNodeParameter('page', index, 1) as number;
			const limit = this.getNodeParameter('limit', index, 10) as number;
			const tokenAddress = this.getNodeParameter('tokenAddress', index, '') as string;

			try {
				const basescanCredentials = await this.getCredentials('basescan');
				const basescan = getBasescanClient({
					apiKey: basescanCredentials.apiKey as string,
					network: credentials.network as string,
				});

				const transfers = await basescan.getTokenTransfers(address, {
					contractAddress: tokenAddress || undefined,
					page,
					offset: limit,
				});

				result = {
					address: checksumAddress(address),
					tokenAddress: tokenAddress ? checksumAddress(tokenAddress) : 'all',
					transfers,
					count: Array.isArray(transfers) ? transfers.length : 0,
				};
			} catch {
				result = {
					address: checksumAddress(address),
					transfers: [],
					count: 0,
					note: 'Basescan API credentials required for token transfers',
				};
			}
			break;
		}

		case 'getNftHoldings': {
			const page = this.getNodeParameter('page', index, 1) as number;
			const limit = this.getNodeParameter('limit', index, 10) as number;

			try {
				const basescanCredentials = await this.getCredentials('basescan');
				const basescan = getBasescanClient({
					apiKey: basescanCredentials.apiKey as string,
					network: credentials.network as string,
				});

				const nfts = await basescan.getNftTransfers(address, {
					page,
					offset: limit,
				});

				result = {
					address: checksumAddress(address),
					nfts,
					count: Array.isArray(nfts) ? nfts.length : 0,
				};
			} catch {
				result = {
					address: checksumAddress(address),
					nfts: [],
					count: 0,
					note: 'Basescan API credentials required for NFT holdings',
				};
			}
			break;
		}

		case 'getNonce': {
			const nonce = await provider.getTransactionCount(address);
			result = {
				address: checksumAddress(address),
				nonce,
			};
			break;
		}

		case 'isContract': {
			const code = await provider.getCode(address);
			const isContract = code !== '0x';
			result = {
				address: checksumAddress(address),
				isContract,
				codeLength: code.length,
			};
			break;
		}

		case 'getCode': {
			const code = await provider.getCode(address);
			result = {
				address: checksumAddress(address),
				code,
				isEmpty: code === '0x',
				length: code.length,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
