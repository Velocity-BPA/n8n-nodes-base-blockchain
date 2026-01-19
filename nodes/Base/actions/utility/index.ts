/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { getProviderFromCredentials, ProviderCredentials } from '../../transport/provider';

export const utilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['utility'],
			},
		},
		options: [
			{
				name: 'Encode ABI',
				value: 'encodeAbi',
				description: 'Encode function call data',
				action: 'Encode ABI',
			},
			{
				name: 'Decode ABI',
				value: 'decodeAbi',
				description: 'Decode function call data',
				action: 'Decode ABI',
			},
			{
				name: 'Hash Message',
				value: 'hashMessage',
				description: 'Hash a message (keccak256)',
				action: 'Hash message',
			},
			{
				name: 'Sign Message',
				value: 'signMessage',
				description: 'Sign a message with private key',
				action: 'Sign message',
			},
			{
				name: 'Verify Signature',
				value: 'verifySignature',
				description: 'Verify a signed message',
				action: 'Verify signature',
			},
			{
				name: 'Convert Units',
				value: 'convertUnits',
				description: 'Convert between ETH units',
				action: 'Convert units',
			},
			{
				name: 'Checksum Address',
				value: 'checksumAddress',
				description: 'Convert address to checksum format',
				action: 'Checksum address',
			},
			{
				name: 'Generate Wallet',
				value: 'generateWallet',
				description: 'Generate a new random wallet',
				action: 'Generate wallet',
			},
			{
				name: 'Compute Address',
				value: 'computeAddress',
				description: 'Compute address from private key',
				action: 'Compute address',
			},
			{
				name: 'Encode Packed',
				value: 'encodePacked',
				description: 'ABI encode packed (solidityPacked)',
				action: 'Encode packed',
			},
		],
		default: 'encodeAbi',
	},
];

export const utilityFields: INodeProperties[] = [
	{
		displayName: 'ABI',
		name: 'abi',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['encodeAbi', 'decodeAbi'],
			},
		},
		description: 'Function ABI (JSON format)',
	},
	{
		displayName: 'Function Name',
		name: 'functionName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['encodeAbi'],
			},
		},
		description: 'Name of the function to encode',
	},
	{
		displayName: 'Arguments',
		name: 'args',
		type: 'string',
		default: '[]',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['encodeAbi'],
			},
		},
		description: 'Function arguments as JSON array',
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['decodeAbi'],
			},
		},
		description: 'Hex data to decode',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['hashMessage', 'signMessage', 'verifySignature'],
			},
		},
		description: 'Message to hash or sign',
	},
	{
		displayName: 'Signature',
		name: 'signature',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['verifySignature'],
			},
		},
		description: 'Signature to verify',
	},
	{
		displayName: 'Expected Signer',
		name: 'expectedSigner',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['verifySignature'],
			},
		},
		description: 'Expected signer address',
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
		description: 'Value to convert',
	},
	{
		displayName: 'From Unit',
		name: 'fromUnit',
		type: 'options',
		options: [
			{ name: 'Wei', value: 'wei' },
			{ name: 'Gwei', value: 'gwei' },
			{ name: 'Ether', value: 'ether' },
		],
		default: 'ether',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
		description: 'Source unit',
	},
	{
		displayName: 'To Unit',
		name: 'toUnit',
		type: 'options',
		options: [
			{ name: 'Wei', value: 'wei' },
			{ name: 'Gwei', value: 'gwei' },
			{ name: 'Ether', value: 'ether' },
		],
		default: 'wei',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
		description: 'Target unit',
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['checksumAddress'],
			},
		},
		description: 'Address to convert to checksum format',
	},
	{
		displayName: 'Private Key',
		name: 'privateKey',
		type: 'string',
		typeOptions: {
			password: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['computeAddress'],
			},
		},
		description: 'Private key to compute address from',
	},
	{
		displayName: 'Types',
		name: 'types',
		type: 'string',
		default: '[]',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['encodePacked'],
			},
		},
		description: 'Types as JSON array (e.g., ["address", "uint256"])',
	},
	{
		displayName: 'Values',
		name: 'values',
		type: 'string',
		default: '[]',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['encodePacked'],
			},
		},
		description: 'Values as JSON array',
	},
];

export async function executeUtilityOperation(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('baseNetwork');
	const { signer } = getProviderFromCredentials(credentials as unknown as ProviderCredentials);
	const operation = this.getNodeParameter('operation', itemIndex) as string;

	let result: IDataObject;

	switch (operation) {
		case 'encodeAbi': {
			const abi = this.getNodeParameter('abi', itemIndex) as string;
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const argsStr = this.getNodeParameter('args', itemIndex) as string;

			const abiArray = JSON.parse(abi);
			const args = JSON.parse(argsStr);
			const iface = new ethers.Interface(abiArray);
			const encoded = iface.encodeFunctionData(functionName, args);

			result = {
				encoded,
				functionName,
				args,
			};
			break;
		}

		case 'decodeAbi': {
			const abi = this.getNodeParameter('abi', itemIndex) as string;
			const data = this.getNodeParameter('data', itemIndex) as string;

			const abiArray = JSON.parse(abi);
			const iface = new ethers.Interface(abiArray);
			const decoded = iface.parseTransaction({ data });

			result = {
				functionName: decoded?.name,
				args: decoded?.args.map((arg) => arg.toString()),
				signature: decoded?.signature,
			};
			break;
		}

		case 'hashMessage': {
			const message = this.getNodeParameter('message', itemIndex) as string;

			result = {
				message,
				keccak256: ethers.keccak256(ethers.toUtf8Bytes(message)),
				hashMessage: ethers.hashMessage(message),
			};
			break;
		}

		case 'signMessage': {
			if (!signer) {
				throw new Error('Private key required to sign messages');
			}

			const message = this.getNodeParameter('message', itemIndex) as string;
			const signature = await signer.signMessage(message);

			result = {
				message,
				signature,
				signer: await signer.getAddress(),
			};
			break;
		}

		case 'verifySignature': {
			const message = this.getNodeParameter('message', itemIndex) as string;
			const signature = this.getNodeParameter('signature', itemIndex) as string;
			const expectedSigner = this.getNodeParameter('expectedSigner', itemIndex) as string;

			const recoveredAddress = ethers.verifyMessage(message, signature);
			const isValid = recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();

			result = {
				message,
				signature,
				expectedSigner,
				recoveredAddress,
				isValid,
			};
			break;
		}

		case 'convertUnits': {
			const value = this.getNodeParameter('value', itemIndex) as string;
			const fromUnit = this.getNodeParameter('fromUnit', itemIndex) as string;
			const toUnit = this.getNodeParameter('toUnit', itemIndex) as string;

			// Convert to wei first
			let weiValue: bigint;
			switch (fromUnit) {
				case 'wei':
					weiValue = BigInt(value);
					break;
				case 'gwei':
					weiValue = ethers.parseUnits(value, 'gwei');
					break;
				case 'ether':
					weiValue = ethers.parseEther(value);
					break;
				default:
					throw new Error(`Unknown from unit: ${fromUnit}`);
			}

			// Convert from wei to target
			let converted: string;
			switch (toUnit) {
				case 'wei':
					converted = weiValue.toString();
					break;
				case 'gwei':
					converted = ethers.formatUnits(weiValue, 'gwei');
					break;
				case 'ether':
					converted = ethers.formatEther(weiValue);
					break;
				default:
					throw new Error(`Unknown to unit: ${toUnit}`);
			}

			result = {
				input: value,
				fromUnit,
				toUnit,
				output: converted,
			};
			break;
		}

		case 'checksumAddress': {
			const address = this.getNodeParameter('address', itemIndex) as string;

			result = {
				input: address,
				checksummed: ethers.getAddress(address),
			};
			break;
		}

		case 'generateWallet': {
			const wallet = ethers.Wallet.createRandom();

			result = {
				address: wallet.address,
				privateKey: wallet.privateKey,
				mnemonic: wallet.mnemonic?.phrase,
				warning: 'Store private key and mnemonic securely!',
			};
			break;
		}

		case 'computeAddress': {
			const privateKey = this.getNodeParameter('privateKey', itemIndex) as string;
			const wallet = new ethers.Wallet(privateKey);

			result = {
				address: wallet.address,
				publicKey: wallet.signingKey.publicKey,
			};
			break;
		}

		case 'encodePacked': {
			const typesStr = this.getNodeParameter('types', itemIndex) as string;
			const valuesStr = this.getNodeParameter('values', itemIndex) as string;

			const types = JSON.parse(typesStr);
			const values = JSON.parse(valuesStr);
			const encoded = ethers.solidityPacked(types, values);

			result = {
				types,
				values,
				encoded,
				keccak256: ethers.keccak256(encoded),
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
