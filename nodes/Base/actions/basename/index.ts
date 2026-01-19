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

export const basenameOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['basename'] } },
		options: [
			{ name: 'Resolve Name', value: 'resolveName', description: 'Resolve basename to address', action: 'Resolve name' },
			{ name: 'Lookup Address', value: 'lookupAddress', description: 'Lookup basename for address', action: 'Lookup address' },
			{ name: 'Check Availability', value: 'checkAvailability', description: 'Check if basename is available', action: 'Check availability' },
		],
		default: 'resolveName',
	},
];

export const basenameFields: INodeProperties[] = [
	{ displayName: 'Name', name: 'name', type: 'string', displayOptions: { show: { resource: ['basename'], operation: ['resolveName', 'checkAvailability'] } }, default: '', placeholder: 'vitalik.base' },
	{ displayName: 'Address', name: 'address', type: 'string', displayOptions: { show: { resource: ['basename'], operation: ['lookupAddress'] } }, default: '' },
];

export async function executeBasenameOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
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
		case 'resolveName': {
			const name = this.getNodeParameter('name', index) as string;
			// Basenames use ENS-compatible resolution
			try {
				const address = await provider.resolveName(name.endsWith('.base') ? name : `${name}.base`);
				result = { name, address: address || null, resolved: !!address };
			} catch {
				result = { name, address: null, resolved: false };
			}
			break;
		}
		case 'lookupAddress': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error(`Invalid address: ${address}`);
			try {
				const name = await provider.lookupAddress(address);
				result = { address, name: name || null, found: !!name };
			} catch {
				result = { address, name: null, found: false };
			}
			break;
		}
		case 'checkAvailability': {
			const name = this.getNodeParameter('name', index) as string;
			try {
				const address = await provider.resolveName(name.endsWith('.base') ? name : `${name}.base`);
				result = { name, available: !address };
			} catch {
				result = { name, available: true };
			}
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
