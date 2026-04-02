import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BaseBlockchainApi implements ICredentialType {
	name = 'baseBlockchainApi';
	displayName = 'Base Blockchain API';
	documentationUrl = 'https://docs.base.org/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'API key for Base blockchain RPC access',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mainnet.base.org',
			required: true,
			description: 'Base blockchain RPC endpoint URL',
		},
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Testnet (Sepolia)',
					value: 'testnet',
				},
			],
			default: 'mainnet',
			description: 'Base network to connect to',
		},
	];
}