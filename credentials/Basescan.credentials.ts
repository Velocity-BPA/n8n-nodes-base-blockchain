/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Basescan implements ICredentialType {
	name = 'basescan';
	displayName = 'Basescan API';
	documentationUrl = 'https://docs.basescan.org/api-endpoints';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Basescan API key for accessing blockchain explorer data',
		},
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			default: 'mainnet',
			options: [
				{
					name: 'Base Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Base Sepolia (Testnet)',
					value: 'sepolia',
				},
			],
			description: 'Select the network for Basescan API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				apikey: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://api.basescan.org" : "https://api-sepolia.basescan.org"}}',
			url: '/api',
			qs: {
				module: 'account',
				action: 'balance',
				address: '0x0000000000000000000000000000000000000000',
				tag: 'latest',
			},
		},
	};
}
