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
import { ERC721_ABI, ERC1155_ABI } from '../../constants/contracts';

export const nftOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['nft'] } },
		options: [
			{ name: 'Get NFT Info', value: 'getNftInfo', description: 'Get NFT collection info', action: 'Get NFT info' },
			{ name: 'Get Token URI', value: 'getTokenUri', description: 'Get token metadata URI', action: 'Get token URI' },
			{ name: 'Get Owner', value: 'getOwner', description: 'Get token owner', action: 'Get owner' },
			{ name: 'Get Balance', value: 'getBalance', description: 'Get NFT balance', action: 'Get balance' },
			{ name: 'Transfer', value: 'transfer', description: 'Transfer NFT', action: 'Transfer' },
		],
		default: 'getNftInfo',
	},
];

export const nftFields: INodeProperties[] = [
	{ displayName: 'Contract Address', name: 'contractAddress', type: 'string', required: true, displayOptions: { show: { resource: ['nft'] } }, default: '' },
	{ displayName: 'Token ID', name: 'tokenId', type: 'string', displayOptions: { show: { resource: ['nft'], operation: ['getTokenUri', 'getOwner', 'transfer'] } }, default: '' },
	{ displayName: 'Owner Address', name: 'ownerAddress', type: 'string', displayOptions: { show: { resource: ['nft'], operation: ['getBalance'] } }, default: '' },
	{ displayName: 'To Address', name: 'to', type: 'string', displayOptions: { show: { resource: ['nft'], operation: ['transfer'] } }, default: '' },
	{ displayName: 'NFT Standard', name: 'standard', type: 'options', displayOptions: { show: { resource: ['nft'] } }, options: [{ name: 'ERC-721', value: 'erc721' }, { name: 'ERC-1155', value: 'erc1155' }], default: 'erc721' },
];

export async function executeNftOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('baseNetwork');
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;
	const standard = this.getNodeParameter('standard', index, 'erc721') as string;

	if (!isValidAddress(contractAddress)) throw new Error(`Invalid contract address: ${contractAddress}`);

	const { provider, signer } = getProviderFromCredentials({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string | undefined,
		privateKey: credentials.privateKey as string | undefined,
		chainId: credentials.chainId as number | undefined,
	});

	const abi = standard === 'erc1155' ? ERC1155_ABI : ERC721_ABI;
	const nft = new ethers.Contract(contractAddress, abi, signer || provider);
	let result: IDataObject;

	switch (operation) {
		case 'getNftInfo': {
			if (standard === 'erc721') {
				const [name, symbol] = await Promise.all([nft.name(), nft.symbol()]);
				result = { address: checksumAddress(contractAddress), name, symbol, standard: 'ERC-721' };
			} else {
				result = { address: checksumAddress(contractAddress), standard: 'ERC-1155' };
			}
			break;
		}
		case 'getTokenUri': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const uri = standard === 'erc1155' ? await nft.uri(tokenId) : await nft.tokenURI(tokenId);
			result = { contractAddress: checksumAddress(contractAddress), tokenId, uri };
			break;
		}
		case 'getOwner': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			if (standard === 'erc1155') throw new Error('ERC-1155 does not have single owner');
			const owner = await nft.ownerOf(tokenId);
			result = { contractAddress: checksumAddress(contractAddress), tokenId, owner };
			break;
		}
		case 'getBalance': {
			const ownerAddress = this.getNodeParameter('ownerAddress', index) as string;
			const balance = await nft.balanceOf(ownerAddress);
			result = { contractAddress: checksumAddress(contractAddress), owner: checksumAddress(ownerAddress), balance: balance.toString() };
			break;
		}
		case 'transfer': {
			if (!signer) throw new Error('Private key required');
			const to = this.getNodeParameter('to', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const from = await signer.getAddress();
			const tx = await nft.transferFrom(from, to, tokenId);
			const receipt = await tx.wait();
			result = { hash: tx.hash, from, to: checksumAddress(to), tokenId, status: receipt?.status === 1 ? 'success' : 'failed' };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
