/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { getProviderFromCredentials } from '../../transport/provider';
import { isValidAddress, checksumAddress } from '../../utils/unitConverter';
import { BRIDGE_CONTRACTS, L1_STANDARD_BRIDGE_ABI, L2_STANDARD_BRIDGE_ABI } from '../../constants/bridges';

export const bridgeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['bridge'] } },
		options: [
			{ name: 'Deposit ETH', value: 'depositEth', description: 'Deposit ETH from L1 to L2', action: 'Deposit ETH' },
			{ name: 'Withdraw ETH', value: 'withdrawEth', description: 'Withdraw ETH from L2 to L1', action: 'Withdraw ETH' },
			{ name: 'Get Bridge Contracts', value: 'getBridgeContracts', description: 'Get bridge addresses', action: 'Get bridge contracts' },
			{ name: 'Estimate Bridge Gas', value: 'estimateBridgeGas', description: 'Estimate gas for bridging', action: 'Estimate bridge gas' },
			{ name: 'Get Withdrawal Status', value: 'getWithdrawalStatus', description: 'Check withdrawal status', action: 'Get withdrawal status' },
		],
		default: 'getBridgeContracts',
	},
];

export const bridgeFields: INodeProperties[] = [
	{ displayName: 'L1 RPC URL', name: 'l1RpcUrl', type: 'string', displayOptions: { show: { resource: ['bridge'], operation: ['depositEth', 'estimateBridgeGas'] } }, default: 'https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY' },
	{ displayName: 'Amount', name: 'amount', type: 'string', displayOptions: { show: { resource: ['bridge'], operation: ['depositEth', 'withdrawEth', 'estimateBridgeGas'] } }, default: '0.01' },
	{ displayName: 'Recipient Address', name: 'recipientAddress', type: 'string', displayOptions: { show: { resource: ['bridge'], operation: ['depositEth', 'withdrawEth'] } }, default: '' },
	{ displayName: 'Transaction Hash', name: 'transactionHash', type: 'string', displayOptions: { show: { resource: ['bridge'], operation: ['getWithdrawalStatus'] } }, default: '' },
	{ displayName: 'Bridge Direction', name: 'bridgeDirection', type: 'options', displayOptions: { show: { resource: ['bridge'], operation: ['estimateBridgeGas'] } }, options: [{ name: 'L1 to L2 (Deposit)', value: 'deposit' }, { name: 'L2 to L1 (Withdraw)', value: 'withdraw' }], default: 'deposit' },
];

export async function executeBridgeOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('baseNetwork');
	const network = credentials.network as string;
	const isMainnet = network === 'mainnet';
	const bridgeContracts = isMainnet ? BRIDGE_CONTRACTS.mainnet : BRIDGE_CONTRACTS.sepolia;

	const { provider: l2Provider, signer: l2Signer } = getProviderFromCredentials({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string | undefined,
		privateKey: credentials.privateKey as string | undefined,
		chainId: credentials.chainId as number | undefined,
	});

	let result: IDataObject;

	switch (operation) {
		case 'depositEth': {
			const l1RpcUrl = this.getNodeParameter('l1RpcUrl', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const recipientAddress = this.getNodeParameter('recipientAddress', index, '') as string;
			if (!credentials.privateKey) throw new Error('Private key required');
			const l1Provider = new ethers.JsonRpcProvider(l1RpcUrl);
			const l1Signer = new ethers.Wallet(credentials.privateKey as string, l1Provider);
			const senderAddress = await l1Signer.getAddress();
			const recipient = recipientAddress || senderAddress;
			const l1Bridge = new ethers.Contract(bridgeContracts.l1StandardBridge, L1_STANDARD_BRIDGE_ABI, l1Signer);
			const amountWei = ethers.parseEther(amount);
			const tx = await l1Bridge.depositETHTo(recipient, 200000, '0x', { value: amountWei });
			const receipt = await tx.wait();
			result = { operation: 'depositEth', hash: tx.hash, from: senderAddress, to: recipient, amount, status: receipt?.status === 1 ? 'success' : 'failed', note: 'Deposit will be available on L2 within ~1-3 minutes' };
			break;
		}
		case 'withdrawEth': {
			if (!l2Signer) throw new Error('Private key required');
			const amount = this.getNodeParameter('amount', index) as string;
			const recipientAddress = this.getNodeParameter('recipientAddress', index, '') as string;
			const senderAddress = await l2Signer.getAddress();
			const recipient = recipientAddress || senderAddress;
			const l2Bridge = new ethers.Contract(bridgeContracts.l2StandardBridge, L2_STANDARD_BRIDGE_ABI, l2Signer);
			const amountWei = ethers.parseEther(amount);
			const tx = await l2Bridge.withdrawTo('0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000', recipient, amountWei, 0, '0x');
			const receipt = await tx.wait();
			result = { operation: 'withdrawEth', hash: tx.hash, from: senderAddress, to: recipient, amount, status: receipt?.status === 1 ? 'success' : 'failed', note: '7-day challenge period required' };
			break;
		}
		case 'getBridgeContracts': {
			result = { network: isMainnet ? 'mainnet' : 'sepolia', contracts: bridgeContracts };
			break;
		}
		case 'estimateBridgeGas': {
			const bridgeDirection = this.getNodeParameter('bridgeDirection', index, 'deposit') as string;
			const feeData = bridgeDirection === 'deposit' ? await new ethers.JsonRpcProvider(this.getNodeParameter('l1RpcUrl', index) as string).getFeeData() : await l2Provider.getFeeData();
			const estimatedGas = bridgeDirection === 'deposit' ? 150000n : 200000n;
			const estimatedCost = estimatedGas * (feeData.gasPrice || 0n);
			result = { direction: bridgeDirection === 'deposit' ? 'L1 to L2' : 'L2 to L1', estimatedGas: estimatedGas.toString(), estimatedCostEth: ethers.formatEther(estimatedCost) };
			break;
		}
		case 'getWithdrawalStatus': {
			const transactionHash = this.getNodeParameter('transactionHash', index) as string;
			const receipt = await l2Provider.getTransactionReceipt(transactionHash);
			if (!receipt) { result = { hash: transactionHash, status: 'not_found' }; break; }
			const currentBlock = await l2Provider.getBlockNumber();
			const confirmations = currentBlock - receipt.blockNumber;
			result = { hash: transactionHash, blockNumber: receipt.blockNumber, confirmations, status: confirmations < 302400 ? 'in_challenge_period' : 'ready_to_prove' };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
