/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	accountOperations,
	accountFields,
	executeAccountOperation,
} from './actions/account';
import {
	transactionOperations,
	transactionFields,
	executeTransactionOperation,
} from './actions/transaction';
import {
	tokenOperations,
	tokenFields,
	executeTokenOperation,
} from './actions/token';
import {
	nftOperations,
	nftFields,
	executeNftOperation,
} from './actions/nft';
import {
	contractOperations,
	contractFields,
	executeContractOperation,
} from './actions/contract';
import {
	bridgeOperations,
	bridgeFields,
	executeBridgeOperation,
} from './actions/bridge';
import {
	blockOperations,
	blockFields,
	executeBlockOperation,
} from './actions/block';
import {
	eventsOperations,
	eventsFields,
	executeEventsOperation,
} from './actions/events';
import {
	onchainKitOperations,
	onchainKitFields,
	executeOnchainKitOperation,
} from './actions/onchainKit';
import {
	basenameOperations,
	basenameFields,
	executeBasenameOperation,
} from './actions/basename';
import {
	attestationOperations,
	attestationFields,
	executeAttestationOperation,
} from './actions/attestation';
import {
	coinbaseWalletOperations,
	coinbaseWalletFields,
	executeCoinbaseWalletOperation,
} from './actions/coinbaseWallet';
import {
	dexOperations,
	dexFields,
	executeDexOperation,
} from './actions/dex';
import {
	farcasterOperations,
	farcasterFields,
	executeFarcasterOperation,
} from './actions/farcaster';
import {
	safeOperations,
	safeFields,
	executeSafeOperation,
} from './actions/safe';
import {
	feeOperations,
	feeFields,
	executeFeeOperation,
} from './actions/fee';
import {
	utilityOperations,
	utilityFields,
	executeUtilityOperation,
} from './actions/utility';

export class Base implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Base',
		name: 'base',
		icon: 'file:base.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Base blockchain (Coinbase L2)',
		defaults: {
			name: 'Base',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'baseNetwork',
				required: true,
			},
			{
				name: 'basescan',
				required: false,
			},
			{
				name: 'coinbaseCloud',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Attestation', value: 'attestation' },
					{ name: 'Basename', value: 'basename' },
					{ name: 'Block', value: 'block' },
					{ name: 'Bridge', value: 'bridge' },
					{ name: 'Coinbase Wallet', value: 'coinbaseWallet' },
					{ name: 'Contract', value: 'contract' },
					{ name: 'DEX', value: 'dex' },
					{ name: 'Events', value: 'events' },
					{ name: 'Farcaster', value: 'farcaster' },
					{ name: 'Fee', value: 'fee' },
					{ name: 'NFT', value: 'nft' },
					{ name: 'OnchainKit', value: 'onchainKit' },
					{ name: 'Safe', value: 'safe' },
					{ name: 'Token', value: 'token' },
					{ name: 'Transaction', value: 'transaction' },
					{ name: 'Utility', value: 'utility' },
				],
				default: 'account',
			},
			// Account operations and fields
			...accountOperations,
			...accountFields,
			// Transaction operations and fields
			...transactionOperations,
			...transactionFields,
			// Token operations and fields
			...tokenOperations,
			...tokenFields,
			// NFT operations and fields
			...nftOperations,
			...nftFields,
			// Contract operations and fields
			...contractOperations,
			...contractFields,
			// Bridge operations and fields
			...bridgeOperations,
			...bridgeFields,
			// Block operations and fields
			...blockOperations,
			...blockFields,
			// Events operations and fields
			...eventsOperations,
			...eventsFields,
			// OnchainKit operations and fields
			...onchainKitOperations,
			...onchainKitFields,
			// Basename operations and fields
			...basenameOperations,
			...basenameFields,
			// Attestation operations and fields
			...attestationOperations,
			...attestationFields,
			// Coinbase Wallet operations and fields
			...coinbaseWalletOperations,
			...coinbaseWalletFields,
			// DEX operations and fields
			...dexOperations,
			...dexFields,
			// Farcaster operations and fields
			...farcasterOperations,
			...farcasterFields,
			// Safe operations and fields
			...safeOperations,
			...safeFields,
			// Fee operations and fields
			...feeOperations,
			...feeFields,
			// Utility operations and fields
			...utilityOperations,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[];

				switch (resource) {
					case 'account':
						result = await executeAccountOperation.call(this, i);
						break;
					case 'transaction':
						result = await executeTransactionOperation.call(this, i);
						break;
					case 'token':
						result = await executeTokenOperation.call(this, i);
						break;
					case 'nft':
						result = await executeNftOperation.call(this, i);
						break;
					case 'contract':
						result = await executeContractOperation.call(this, i);
						break;
					case 'bridge':
						result = await executeBridgeOperation.call(this, i);
						break;
					case 'block':
						result = await executeBlockOperation.call(this, i);
						break;
					case 'events':
						result = await executeEventsOperation.call(this, i);
						break;
					case 'onchainKit':
						result = await executeOnchainKitOperation.call(this, i);
						break;
					case 'basename':
						result = await executeBasenameOperation.call(this, i);
						break;
					case 'attestation':
						result = await executeAttestationOperation.call(this, i);
						break;
					case 'coinbaseWallet':
						result = await executeCoinbaseWalletOperation.call(this, i);
						break;
					case 'dex':
						result = await executeDexOperation.call(this, i);
						break;
					case 'farcaster':
						result = await executeFarcasterOperation.call(this, i);
						break;
					case 'safe':
						result = await executeSafeOperation.call(this, i);
						break;
					case 'fee':
						result = await executeFeeOperation.call(this, i);
						break;
					case 'utility':
						result = await executeUtilityOperation.call(this, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
