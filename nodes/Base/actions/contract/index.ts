/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { getProviderFromCredentials } from '../../transport/provider';
import { getBasescanClient } from '../../transport/explorerApi';
import { isValidAddress, checksumAddress } from '../../utils/unitConverter';
import { MULTICALL3_ADDRESS } from '../../constants/contracts';

export const contractOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contract'] } },
		options: [
			{ name: 'Read Contract', value: 'readContract', description: 'Call a read-only contract function', action: 'Read contract' },
			{ name: 'Write Contract', value: 'writeContract', description: 'Execute a state-changing function', action: 'Write contract' },
			{ name: 'Deploy Contract', value: 'deployContract', description: 'Deploy a new contract', action: 'Deploy contract' },
			{ name: 'Get Contract ABI', value: 'getContractAbi', description: 'Get verified contract ABI', action: 'Get contract ABI' },
			{ name: 'Multicall', value: 'multicall', description: 'Batch multiple read calls', action: 'Multicall' },
		],
		default: 'readContract',
	},
];

export const contractFields: INodeProperties[] = [
	{ displayName: 'Contract Address', name: 'contractAddress', type: 'string', displayOptions: { show: { resource: ['contract'], operation: ['readContract', 'writeContract', 'getContractAbi'] } }, default: '' },
	{ displayName: 'Contract ABI', name: 'contractAbi', type: 'json', displayOptions: { show: { resource: ['contract'], operation: ['readContract', 'writeContract', 'deployContract'] } }, default: '[]' },
	{ displayName: 'Function Name', name: 'functionName', type: 'string', displayOptions: { show: { resource: ['contract'], operation: ['readContract', 'writeContract'] } }, default: '' },
	{ displayName: 'Function Arguments', name: 'functionArgs', type: 'json', displayOptions: { show: { resource: ['contract'], operation: ['readContract', 'writeContract'] } }, default: '[]' },
	{ displayName: 'Bytecode', name: 'bytecode', type: 'string', displayOptions: { show: { resource: ['contract'], operation: ['deployContract'] } }, default: '' },
	{ displayName: 'Constructor Arguments', name: 'constructorArgs', type: 'json', displayOptions: { show: { resource: ['contract'], operation: ['deployContract'] } }, default: '[]' },
	{ displayName: 'Calls', name: 'multicallCalls', type: 'json', displayOptions: { show: { resource: ['contract'], operation: ['multicall'] } }, default: '[]' },
];

export async function executeContractOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
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
		case 'readContract': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const contractAbi = this.getNodeParameter('contractAbi', index) as string;
			const functionName = this.getNodeParameter('functionName', index) as string;
			const functionArgs = this.getNodeParameter('functionArgs', index) as string;
			if (!isValidAddress(contractAddress)) throw new Error(`Invalid address: ${contractAddress}`);
			const abi = typeof contractAbi === 'string' ? JSON.parse(contractAbi) : contractAbi;
			const args = typeof functionArgs === 'string' ? JSON.parse(functionArgs) : functionArgs;
			const contract = new ethers.Contract(contractAddress, abi, provider);
			const response = await contract[functionName](...args);
			const formattedResult = typeof response === 'bigint' ? response.toString() : response;
			result = { contractAddress: checksumAddress(contractAddress), functionName, result: formattedResult };
			break;
		}
		case 'writeContract': {
			if (!signer) throw new Error('Private key required');
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const contractAbi = this.getNodeParameter('contractAbi', index) as string;
			const functionName = this.getNodeParameter('functionName', index) as string;
			const functionArgs = this.getNodeParameter('functionArgs', index) as string;
			const abi = typeof contractAbi === 'string' ? JSON.parse(contractAbi) : contractAbi;
			const args = typeof functionArgs === 'string' ? JSON.parse(functionArgs) : functionArgs;
			const contract = new ethers.Contract(contractAddress, abi, signer);
			const tx = await contract[functionName](...args);
			const receipt = await tx.wait();
			result = { hash: tx.hash, contractAddress: checksumAddress(contractAddress), functionName, status: receipt?.status === 1 ? 'success' : 'failed' };
			break;
		}
		case 'deployContract': {
			if (!signer) throw new Error('Private key required');
			const contractAbi = this.getNodeParameter('contractAbi', index) as string;
			const bytecode = this.getNodeParameter('bytecode', index) as string;
			const constructorArgs = this.getNodeParameter('constructorArgs', index, '[]') as string;
			const abi = typeof contractAbi === 'string' ? JSON.parse(contractAbi) : contractAbi;
			const args = typeof constructorArgs === 'string' ? JSON.parse(constructorArgs) : constructorArgs;
			const factory = new ethers.ContractFactory(abi, bytecode, signer);
			const contract = await factory.deploy(...args);
			await contract.waitForDeployment();
			const contractAddress = await contract.getAddress();
			result = { contractAddress, from: await signer.getAddress() };
			break;
		}
		case 'getContractAbi': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			try {
				const basescanCredentials = await this.getCredentials('basescan');
				const basescan = getBasescanClient({ apiKey: basescanCredentials.apiKey as string, network: credentials.network as string });
				const abi = await basescan.getContractABI(contractAddress);
				result = { contractAddress: checksumAddress(contractAddress), abi, verified: true };
			} catch {
				throw new Error('Basescan API credentials required');
			}
			break;
		}
		case 'multicall': {
			const multicallCalls = this.getNodeParameter('multicallCalls', index) as string;
			const calls = typeof multicallCalls === 'string' ? JSON.parse(multicallCalls) : multicallCalls;
			const multicallAbi = ['function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[])'];
			const multicall = new ethers.Contract(MULTICALL3_ADDRESS, multicallAbi, provider);
			const formattedCalls = calls.map((call: { target: string; callData: string; allowFailure?: boolean }) => ({ target: call.target, allowFailure: call.allowFailure ?? true, callData: call.callData }));
			const results = await multicall.aggregate3(formattedCalls);
			result = { multicallAddress: MULTICALL3_ADDRESS, results: results.map((r: { success: boolean; returnData: string }, i: number) => ({ call: calls[i], success: r.success, returnData: r.returnData })), count: results.length };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
