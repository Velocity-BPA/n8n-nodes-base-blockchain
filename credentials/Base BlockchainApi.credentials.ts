import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BaseBlockchainApi implements ICredentialType {
	name = 'baseBlockchainApi';
	displayName = 'Base Blockchain API';
	documentationUrl = 'https://docs.basescan.org/';
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
			description: 'API key from Basescan.org',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.basescan.org/api',
			description: 'Base URL for the Basescan API',
		},
	];
}