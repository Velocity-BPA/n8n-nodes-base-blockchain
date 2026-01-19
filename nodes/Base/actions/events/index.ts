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

export const eventsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['events'] } },
		options: [
			{ name: 'Get Logs', value: 'getLogs', description: 'Get filtered event logs', action: 'Get logs' },
			{ name: 'Get Transfer Events', value: 'getTransferEvents', description: 'Get ERC-20 Transfer events', action: 'Get transfer events' },
		],
		default: 'getLogs',
	},
];

export const eventsFields: INodeProperties[] = [
	{ displayName: 'Contract Address', name: 'contractAddress', type: 'string', displayOptions: { show: { resource: ['events'] } }, default: '' },
	{ displayName: 'From Block', name: 'fromBlock', type: 'string', displayOptions: { show: { resource: ['events'] } }, default: 'latest' },
	{ displayName: 'To Block', name: 'toBlock', type: 'string', displayOptions: { show: { resource: ['events'] } }, default: 'latest' },
];

export async function executeEventsOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
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
		case 'getLogs': {
			const contractAddress = this.getNodeParameter('contractAddress', index, '') as string;
			const fromBlock = this.getNodeParameter('fromBlock', index, 'latest') as string;
			const toBlock = this.getNodeParameter('toBlock', index, 'latest') as string;
			const filter: ethers.Filter = {
				fromBlock: fromBlock === 'latest' ? 'latest' : parseInt(fromBlock, 10),
				toBlock: toBlock === 'latest' ? 'latest' : parseInt(toBlock, 10),
			};
			if (contractAddress && isValidAddress(contractAddress)) filter.address = contractAddress;
			const logs = await provider.getLogs(filter);
			result = { logs: logs.map(log => ({ blockNumber: log.blockNumber, transactionHash: log.transactionHash, address: log.address, data: log.data })), count: logs.length };
			break;
		}
		case 'getTransferEvents': {
			const contractAddress = this.getNodeParameter('contractAddress', index, '') as string;
			const fromBlock = this.getNodeParameter('fromBlock', index, 'latest') as string;
			const toBlock = this.getNodeParameter('toBlock', index, 'latest') as string;
			const TRANSFER_SIG = ethers.id('Transfer(address,address,uint256)');
			const filter: ethers.Filter = {
				fromBlock: fromBlock === 'latest' ? 'latest' : parseInt(fromBlock, 10),
				toBlock: toBlock === 'latest' ? 'latest' : parseInt(toBlock, 10),
				topics: [TRANSFER_SIG],
			};
			if (contractAddress && isValidAddress(contractAddress)) filter.address = contractAddress;
			const logs = await provider.getLogs(filter);
			result = { transfers: logs.map(log => ({ blockNumber: log.blockNumber, transactionHash: log.transactionHash, address: log.address })), count: logs.length };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
