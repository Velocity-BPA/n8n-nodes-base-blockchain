/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { getProviderFromCredentials } from '../../transport/provider';

export const blockOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['block'] } },
		options: [
			{ name: 'Get Block', value: 'getBlock', description: 'Get block by number or hash', action: 'Get block' },
			{ name: 'Get Latest Block', value: 'getLatestBlock', description: 'Get the latest block', action: 'Get latest block' },
			{ name: 'Get Block Number', value: 'getBlockNumber', description: 'Get current block number', action: 'Get block number' },
		],
		default: 'getLatestBlock',
	},
];

export const blockFields: INodeProperties[] = [
	{ displayName: 'Block Identifier', name: 'blockIdentifier', type: 'string', displayOptions: { show: { resource: ['block'], operation: ['getBlock'] } }, default: 'latest' },
];

export async function executeBlockOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
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
		case 'getBlock': {
			const blockIdentifier = this.getNodeParameter('blockIdentifier', index) as string;
			let blockTag: string | number = blockIdentifier;
			if (!['latest', 'pending', 'earliest'].includes(blockIdentifier) && !blockIdentifier.startsWith('0x')) {
				blockTag = parseInt(blockIdentifier, 10);
			}
			const block = await provider.getBlock(blockTag);
			if (!block) throw new Error(`Block not found: ${blockIdentifier}`);
			result = { number: block.number, hash: block.hash, timestamp: block.timestamp, gasUsed: block.gasUsed?.toString(), transactionCount: block.transactions?.length || 0 };
			break;
		}
		case 'getLatestBlock': {
			const block = await provider.getBlock('latest');
			if (!block) throw new Error('Latest block not found');
			result = { number: block.number, hash: block.hash, timestamp: block.timestamp, gasUsed: block.gasUsed?.toString() };
			break;
		}
		case 'getBlockNumber': {
			const blockNumber = await provider.getBlockNumber();
			result = { blockNumber };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
