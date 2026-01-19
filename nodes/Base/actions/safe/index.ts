/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import axios from 'axios';
import { getProviderFromCredentials, ProviderCredentials } from '../../transport/provider';

export const safeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['safe'],
			},
		},
		options: [
			{
				name: 'Get Safe Info',
				value: 'getSafeInfo',
				description: 'Get Safe multisig information',
				action: 'Get safe info',
			},
			{
				name: 'Get Owners',
				value: 'getOwners',
				description: 'Get Safe owners',
				action: 'Get owners',
			},
			{
				name: 'Get Pending Transactions',
				value: 'getPendingTransactions',
				description: 'Get pending transactions',
				action: 'Get pending transactions',
			},
			{
				name: 'Get Transaction History',
				value: 'getTransactionHistory',
				description: 'Get executed transactions',
				action: 'Get transaction history',
			},
			{
				name: 'Propose Transaction',
				value: 'proposeTransaction',
				description: 'Propose a new transaction',
				action: 'Propose transaction',
			},
			{
				name: 'Get Transaction',
				value: 'getTransaction',
				description: 'Get transaction details',
				action: 'Get transaction',
			},
			{
				name: 'Confirm Transaction',
				value: 'confirmTransaction',
				description: 'Add confirmation to transaction',
				action: 'Confirm transaction',
			},
			{
				name: 'Execute Transaction',
				value: 'executeTransaction',
				description: 'Execute a confirmed transaction',
				action: 'Execute transaction',
			},
			{
				name: 'Get Balances',
				value: 'getBalances',
				description: 'Get Safe token balances',
				action: 'Get balances',
			},
			{
				name: 'Get Collectibles',
				value: 'getCollectibles',
				description: 'Get Safe NFT holdings',
				action: 'Get collectibles',
			},
		],
		default: 'getSafeInfo',
	},
];

export const safeFields: INodeProperties[] = [
	{
		displayName: 'Safe Address',
		name: 'safeAddress',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['safe'],
			},
		},
		description: 'The Safe multisig address',
	},
	{
		displayName: 'Safe Transaction Hash',
		name: 'safeTxHash',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['safe'],
				operation: ['getTransaction', 'confirmTransaction', 'executeTransaction'],
			},
		},
		description: 'The Safe transaction hash',
	},
	{
		displayName: 'To Address',
		name: 'to',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['safe'],
				operation: ['proposeTransaction'],
			},
		},
		description: 'Destination address for the transaction',
	},
	{
		displayName: 'Value (ETH)',
		name: 'value',
		type: 'string',
		default: '0',
		displayOptions: {
			show: {
				resource: ['safe'],
				operation: ['proposeTransaction'],
			},
		},
		description: 'Amount of ETH to send',
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '0x',
		displayOptions: {
			show: {
				resource: ['safe'],
				operation: ['proposeTransaction'],
			},
		},
		description: 'Transaction data (hex)',
	},
];

const SAFE_API_URL = 'https://safe-transaction-base.safe.global/api/v1';

export async function executeSafeOperation(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('baseNetwork');
	const { provider, signer } = getProviderFromCredentials(credentials as unknown as ProviderCredentials);
	const safeAddress = this.getNodeParameter('safeAddress', itemIndex) as string;
	const operation = this.getNodeParameter('operation', itemIndex) as string;

	let result: IDataObject;

	switch (operation) {
		case 'getSafeInfo': {
			const response = await axios.get(`${SAFE_API_URL}/safes/${safeAddress}/`);
			result = response.data as IDataObject;
			break;
		}

		case 'getOwners': {
			const response = await axios.get(`${SAFE_API_URL}/safes/${safeAddress}/`);
			result = {
				owners: response.data.owners,
				threshold: response.data.threshold,
				nonce: response.data.nonce,
			};
			break;
		}

		case 'getPendingTransactions': {
			const response = await axios.get(
				`${SAFE_API_URL}/safes/${safeAddress}/multisig-transactions/?executed=false`
			);
			result = {
				count: response.data.count,
				transactions: response.data.results,
			};
			break;
		}

		case 'getTransactionHistory': {
			const response = await axios.get(
				`${SAFE_API_URL}/safes/${safeAddress}/multisig-transactions/?executed=true`
			);
			result = {
				count: response.data.count,
				transactions: response.data.results,
			};
			break;
		}

		case 'proposeTransaction': {
			if (!signer) {
				throw new Error('Private key required to propose transactions');
			}

			const to = this.getNodeParameter('to', itemIndex) as string;
			const value = this.getNodeParameter('value', itemIndex) as string;
			const data = this.getNodeParameter('data', itemIndex) as string;

			// Get Safe info for nonce
			const safeInfoResponse = await axios.get(`${SAFE_API_URL}/safes/${safeAddress}/`);
			const nonce = safeInfoResponse.data.nonce;

			// Create transaction data
			const txData = {
				to,
				value: ethers.parseEther(value).toString(),
				data,
				operation: 0, // CALL
				safeTxGas: 0,
				baseGas: 0,
				gasPrice: 0,
				gasToken: ethers.ZeroAddress,
				refundReceiver: ethers.ZeroAddress,
				nonce,
			};

			// Calculate transaction hash
			const SAFE_ABI = [
				'function getTransactionHash(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, uint256 _nonce) view returns (bytes32)',
			];
			const safeContract = new ethers.Contract(safeAddress, SAFE_ABI, provider);
			const safeTxHash = await safeContract.getTransactionHash(
				txData.to,
				txData.value,
				txData.data,
				txData.operation,
				txData.safeTxGas,
				txData.baseGas,
				txData.gasPrice,
				txData.gasToken,
				txData.refundReceiver,
				txData.nonce
			);

			// Sign the transaction hash
			const signature = await signer.signMessage(ethers.getBytes(safeTxHash));

			// Submit to Safe Transaction Service
			const response = await axios.post(
				`${SAFE_API_URL}/safes/${safeAddress}/multisig-transactions/`,
				{
					...txData,
					contractTransactionHash: safeTxHash,
					sender: await signer.getAddress(),
					signature,
				}
			);

			result = {
				safeTxHash,
				proposed: true,
				response: response.data,
			};
			break;
		}

		case 'getTransaction': {
			const safeTxHash = this.getNodeParameter('safeTxHash', itemIndex) as string;
			const response = await axios.get(
				`${SAFE_API_URL}/multisig-transactions/${safeTxHash}/`
			);
			result = response.data as IDataObject;
			break;
		}

		case 'confirmTransaction': {
			if (!signer) {
				throw new Error('Private key required to confirm transactions');
			}

			const safeTxHash = this.getNodeParameter('safeTxHash', itemIndex) as string;
			const signature = await signer.signMessage(ethers.getBytes(safeTxHash));

			const response = await axios.post(
				`${SAFE_API_URL}/multisig-transactions/${safeTxHash}/confirmations/`,
				{ signature }
			);

			result = {
				safeTxHash,
				confirmed: true,
				response: response.data,
			};
			break;
		}

		case 'executeTransaction': {
			if (!signer) {
				throw new Error('Private key required to execute transactions');
			}

			const safeTxHash = this.getNodeParameter('safeTxHash', itemIndex) as string;

			// Get transaction details
			const txResponse = await axios.get(
				`${SAFE_API_URL}/multisig-transactions/${safeTxHash}/`
			);
			const txData = txResponse.data;

			// Build signatures from confirmations
			const signatures = txData.confirmations
				.sort((a: IDataObject, b: IDataObject) =>
					(a.owner as string).toLowerCase().localeCompare((b.owner as string).toLowerCase())
				)
				.map((c: IDataObject) => c.signature)
				.join('');

			// Execute through Safe contract
			const SAFE_EXEC_ABI = [
				'function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address payable refundReceiver, bytes signatures) payable returns (bool success)',
			];
			const safeContract = new ethers.Contract(safeAddress, SAFE_EXEC_ABI, signer);

			const tx = await safeContract.execTransaction(
				txData.to,
				txData.value,
				txData.data || '0x',
				txData.operation,
				txData.safeTxGas,
				txData.baseGas,
				txData.gasPrice,
				txData.gasToken,
				txData.refundReceiver,
				signatures
			);

			const receipt = await tx.wait();

			result = {
				transactionHash: receipt.hash,
				blockNumber: receipt.blockNumber,
				executed: true,
			};
			break;
		}

		case 'getBalances': {
			const response = await axios.get(
				`${SAFE_API_URL}/safes/${safeAddress}/balances/`
			);
			result = {
				balances: response.data,
			};
			break;
		}

		case 'getCollectibles': {
			const response = await axios.get(
				`${SAFE_API_URL}/safes/${safeAddress}/collectibles/`
			);
			result = {
				collectibles: response.data,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
