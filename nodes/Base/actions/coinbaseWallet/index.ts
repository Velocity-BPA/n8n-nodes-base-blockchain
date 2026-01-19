/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { getProviderFromCredentials } from '../../transport/provider';
import { isValidAddress } from '../../utils/unitConverter';

export const coinbaseWalletOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['coinbaseWallet'] } },
		options: [
			{ name: 'Get Wallet Info', value: 'getWalletInfo', description: 'Get smart wallet information', action: 'Get wallet info' },
			{ name: 'Predict Address', value: 'predictAddress', description: 'Predict smart wallet address', action: 'Predict address' },
		],
		default: 'getWalletInfo',
	},
];

export const coinbaseWalletFields: INodeProperties[] = [
	{ displayName: 'Wallet Address', name: 'walletAddress', type: 'string', displayOptions: { show: { resource: ['coinbaseWallet'], operation: ['getWalletInfo'] } }, default: '' },
	{ displayName: 'Owner Address', name: 'ownerAddress', type: 'string', displayOptions: { show: { resource: ['coinbaseWallet'], operation: ['predictAddress'] } }, default: '' },
];

export async function executeCoinbaseWalletOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('baseNetwork');

	const { provider } = getProviderFromCredentials({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string | undefined,
		privateKey: credentials.privateKey as string | undefined,
		chainId: credentials.chainId as number | undefined,
	});

	let result: IDataObject;

	switch (operation) {
		case 'getWalletInfo': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			if (!isValidAddress(walletAddress)) throw new Error(`Invalid address: ${walletAddress}`);
			const balance = await provider.getBalance(walletAddress);
			const code = await provider.getCode(walletAddress);
			result = { address: walletAddress, balance: ethers.formatEther(balance), isDeployed: code !== '0x', type: 'Smart Wallet' };
			break;
		}
		case 'predictAddress': {
			const ownerAddress = this.getNodeParameter('ownerAddress', index) as string;
			if (!isValidAddress(ownerAddress)) throw new Error(`Invalid address: ${ownerAddress}`);
			// Smart wallet address prediction would require the factory contract
			result = { owner: ownerAddress, note: 'Address prediction requires Coinbase Smart Wallet factory' };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
