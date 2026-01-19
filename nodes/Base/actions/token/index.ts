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
import { ERC20_ABI } from '../../constants/contracts';

export const tokenOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['token'] } },
		options: [
			{ name: 'Get Token Info', value: 'getTokenInfo', description: 'Get ERC-20 token information', action: 'Get token info' },
			{ name: 'Get Balance', value: 'getBalance', description: 'Get token balance', action: 'Get balance' },
			{ name: 'Transfer', value: 'transfer', description: 'Transfer tokens', action: 'Transfer' },
			{ name: 'Approve', value: 'approve', description: 'Approve token spending', action: 'Approve' },
			{ name: 'Get Allowance', value: 'getAllowance', description: 'Get token allowance', action: 'Get allowance' },
		],
		default: 'getTokenInfo',
	},
];

export const tokenFields: INodeProperties[] = [
	{ displayName: 'Token Address', name: 'tokenAddress', type: 'string', required: true, displayOptions: { show: { resource: ['token'] } }, default: '', placeholder: '0x...' },
	{ displayName: 'Holder Address', name: 'holderAddress', type: 'string', displayOptions: { show: { resource: ['token'], operation: ['getBalance', 'getAllowance'] } }, default: '' },
	{ displayName: 'To Address', name: 'to', type: 'string', displayOptions: { show: { resource: ['token'], operation: ['transfer'] } }, default: '' },
	{ displayName: 'Spender Address', name: 'spender', type: 'string', displayOptions: { show: { resource: ['token'], operation: ['approve', 'getAllowance'] } }, default: '' },
	{ displayName: 'Amount', name: 'amount', type: 'string', displayOptions: { show: { resource: ['token'], operation: ['transfer', 'approve'] } }, default: '' },
];

export async function executeTokenOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('baseNetwork');
	const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;

	if (!isValidAddress(tokenAddress)) throw new Error(`Invalid token address: ${tokenAddress}`);

	const { provider, signer } = getProviderFromCredentials({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string | undefined,
		privateKey: credentials.privateKey as string | undefined,
		chainId: credentials.chainId as number | undefined,
	});

	const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer || provider);
	let result: IDataObject;

	switch (operation) {
		case 'getTokenInfo': {
			const [name, symbol, decimals, totalSupply] = await Promise.all([
				token.name(), token.symbol(), token.decimals(), token.totalSupply()
			]);
			result = { address: checksumAddress(tokenAddress), name, symbol, decimals, totalSupply: totalSupply.toString() };
			break;
		}
		case 'getBalance': {
			const holderAddress = this.getNodeParameter('holderAddress', index) as string;
			const [balance, decimals, symbol] = await Promise.all([
				token.balanceOf(holderAddress), token.decimals(), token.symbol()
			]);
			result = { tokenAddress: checksumAddress(tokenAddress), holder: checksumAddress(holderAddress), balance: balance.toString(), formatted: ethers.formatUnits(balance, decimals), symbol };
			break;
		}
		case 'transfer': {
			if (!signer) throw new Error('Private key required');
			const to = this.getNodeParameter('to', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const decimals = await token.decimals();
			const tx = await token.transfer(to, ethers.parseUnits(amount, decimals));
			const receipt = await tx.wait();
			result = { hash: tx.hash, to: checksumAddress(to), amount, status: receipt?.status === 1 ? 'success' : 'failed' };
			break;
		}
		case 'approve': {
			if (!signer) throw new Error('Private key required');
			const spender = this.getNodeParameter('spender', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const decimals = await token.decimals();
			const tx = await token.getFunction('approve')(spender, ethers.parseUnits(amount, decimals));
			const receipt = await tx.wait();
			result = { hash: tx.hash, spender: checksumAddress(spender), amount, status: receipt?.status === 1 ? 'success' : 'failed' };
			break;
		}
		case 'getAllowance': {
			const holderAddress = this.getNodeParameter('holderAddress', index) as string;
			const spender = this.getNodeParameter('spender', index) as string;
			const [allowance, decimals] = await Promise.all([
				token.getFunction('allowance')(holderAddress, spender), token.decimals()
			]);
			result = { owner: checksumAddress(holderAddress), spender: checksumAddress(spender), allowance: allowance.toString(), formatted: ethers.formatUnits(allowance, decimals) };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
