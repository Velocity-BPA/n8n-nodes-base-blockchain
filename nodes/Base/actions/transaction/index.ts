/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { getProviderFromCredentials } from '../../transport/provider';
import { isValidAddress, checksumAddress, weiToEther, etherToWei } from '../../utils/unitConverter';

export const transactionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['transaction'] } },
		options: [
			{ name: 'Send ETH', value: 'sendEth', description: 'Send ETH to an address', action: 'Send ETH' },
			{ name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction details', action: 'Get transaction' },
			{ name: 'Get Receipt', value: 'getReceipt', description: 'Get transaction receipt', action: 'Get receipt' },
			{ name: 'Estimate Gas', value: 'estimateGas', description: 'Estimate gas for a transaction', action: 'Estimate gas' },
			{ name: 'Wait for Transaction', value: 'waitForTransaction', description: 'Wait for transaction confirmation', action: 'Wait for transaction' },
		],
		default: 'sendEth',
	},
];

export const transactionFields: INodeProperties[] = [
	{ displayName: 'To Address', name: 'to', type: 'string', required: true, displayOptions: { show: { resource: ['transaction'], operation: ['sendEth', 'estimateGas'] } }, default: '', placeholder: '0x...' },
	{ displayName: 'Amount (ETH)', name: 'amount', type: 'string', required: true, displayOptions: { show: { resource: ['transaction'], operation: ['sendEth'] } }, default: '0.01' },
	{ displayName: 'Transaction Hash', name: 'txHash', type: 'string', required: true, displayOptions: { show: { resource: ['transaction'], operation: ['getTransaction', 'getReceipt', 'waitForTransaction'] } }, default: '', placeholder: '0x...' },
	{ displayName: 'Confirmations', name: 'confirmations', type: 'number', displayOptions: { show: { resource: ['transaction'], operation: ['waitForTransaction'] } }, default: 1 },
];

export async function executeTransactionOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('baseNetwork');
	const { provider, signer } = getProviderFromCredentials({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string | undefined,
		privateKey: credentials.privateKey as string | undefined,
		chainId: credentials.chainId as number | undefined,
	});

	let result: IDataObject;

	switch (operation) {
		case 'sendEth': {
			if (!signer) throw new Error('Private key required to send transactions');
			const to = this.getNodeParameter('to', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			if (!isValidAddress(to)) throw new Error(`Invalid address: ${to}`);
			const tx = await signer.sendTransaction({ to, value: etherToWei(amount) });
			const receipt = await tx.wait();
			result = { hash: tx.hash, from: await signer.getAddress(), to: checksumAddress(to), amount, amountWei: etherToWei(amount).toString(), blockNumber: receipt?.blockNumber, status: receipt?.status === 1 ? 'success' : 'failed' };
			break;
		}
		case 'getTransaction': {
			const txHash = this.getNodeParameter('txHash', index) as string;
			const tx = await provider.getTransaction(txHash);
			if (!tx) throw new Error(`Transaction not found: ${txHash}`);
			result = { hash: tx.hash, from: tx.from, to: tx.to, value: weiToEther(tx.value), gasPrice: tx.gasPrice?.toString(), gasLimit: tx.gasLimit?.toString(), nonce: tx.nonce, blockNumber: tx.blockNumber };
			break;
		}
		case 'getReceipt': {
			const txHash = this.getNodeParameter('txHash', index) as string;
			const receipt = await provider.getTransactionReceipt(txHash);
			if (!receipt) throw new Error(`Receipt not found: ${txHash}`);
			result = { hash: receipt.hash, from: receipt.from, to: receipt.to, status: receipt.status === 1 ? 'success' : 'failed', blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed?.toString() };
			break;
		}
		case 'estimateGas': {
			const to = this.getNodeParameter('to', index) as string;
			const gas = await provider.estimateGas({ to, value: etherToWei('0.01') });
			const feeData = await provider.getFeeData();
			result = { gasEstimate: gas.toString(), gasPrice: feeData.gasPrice?.toString(), estimatedCostWei: (gas * (feeData.gasPrice || 0n)).toString(), estimatedCostEth: weiToEther(gas * (feeData.gasPrice || 0n)) };
			break;
		}
		case 'waitForTransaction': {
			const txHash = this.getNodeParameter('txHash', index) as string;
			const confirmations = this.getNodeParameter('confirmations', index, 1) as number;
			const receipt = await provider.waitForTransaction(txHash, confirmations);
			result = { hash: txHash, confirmed: true, confirmations, blockNumber: receipt?.blockNumber, status: receipt?.status === 1 ? 'success' : 'failed' };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
