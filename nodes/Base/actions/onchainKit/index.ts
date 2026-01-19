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

export const onchainKitOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['onchainKit'] } },
		options: [
			{ name: 'Resolve Basename', value: 'resolveBasename', description: 'Resolve a Basename to address', action: 'Resolve basename' },
			{ name: 'Get Identity', value: 'getIdentity', description: 'Get on-chain identity', action: 'Get identity' },
		],
		default: 'resolveBasename',
	},
];

export const onchainKitFields: INodeProperties[] = [
	{ displayName: 'Basename', name: 'basename', type: 'string', displayOptions: { show: { resource: ['onchainKit'], operation: ['resolveBasename'] } }, default: '', placeholder: 'vitalik.base' },
	{ displayName: 'Address', name: 'address', type: 'string', displayOptions: { show: { resource: ['onchainKit'], operation: ['getIdentity'] } }, default: '' },
];

export async function executeOnchainKitOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
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
		case 'resolveBasename': {
			const basename = this.getNodeParameter('basename', index) as string;
			// Simple resolver - in production would use the actual resolver contract
			result = { basename, note: 'Use Basename resource for full resolution' };
			break;
		}
		case 'getIdentity': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error(`Invalid address: ${address}`);
			const balance = await provider.getBalance(address);
			const nonce = await provider.getTransactionCount(address);
			result = { address, balance: ethers.formatEther(balance), nonce };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
