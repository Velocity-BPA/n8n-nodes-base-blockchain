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

export class BaseNetwork implements ICredentialType {
	name = 'baseNetwork';
	displayName = 'Base Network';
	documentationUrl = 'https://docs.base.org';
	properties: INodeProperties[] = [
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
				{
					name: 'Custom Endpoint',
					value: 'custom',
				},
			],
			description: 'Select the Base network to connect to',
		},
		{
			displayName: 'RPC URL',
			name: 'rpcUrl',
			type: 'string',
			default: '',
			placeholder: 'https://mainnet.base.org',
			description: 'Custom RPC endpoint URL. Leave empty to use default public endpoints.',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for signing transactions. Required for write operations.',
		},
		{
			displayName: 'Chain ID',
			name: 'chainId',
			type: 'number',
			default: 8453,
			description: 'Chain ID for the network. Base Mainnet: 8453, Base Sepolia: 84532',
		},
		{
			displayName: 'Coinbase Developer Platform API Key',
			name: 'cdpApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional: Coinbase Developer Platform API key for enhanced features',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://mainnet.base.org" : $credentials.network === "sepolia" ? "https://sepolia.base.org" : $credentials.rpcUrl}}',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				method: 'eth_chainId',
				params: [],
				id: 1,
			}),
		},
	};
}
