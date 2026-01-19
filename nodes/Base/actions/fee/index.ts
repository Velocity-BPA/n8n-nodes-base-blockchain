/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { getProviderFromCredentials, ProviderCredentials } from '../../transport/provider';

export const feeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['fee'],
			},
		},
		options: [
			{
				name: 'Get Gas Price',
				value: 'getGasPrice',
				description: 'Get current gas price',
				action: 'Get gas price',
			},
			{
				name: 'Get Fee Data',
				value: 'getFeeData',
				description: 'Get EIP-1559 fee data',
				action: 'Get fee data',
			},
			{
				name: 'Estimate Gas',
				value: 'estimateGas',
				description: 'Estimate gas for a transaction',
				action: 'Estimate gas',
			},
			{
				name: 'Get L1 Data Fee',
				value: 'getL1DataFee',
				description: 'Get L1 data posting fee',
				action: 'Get L1 data fee',
			},
			{
				name: 'Get Base Fee',
				value: 'getBaseFee',
				description: 'Get current base fee',
				action: 'Get base fee',
			},
			{
				name: 'Calculate Total Fee',
				value: 'calculateTotalFee',
				description: 'Calculate total transaction fee',
				action: 'Calculate total fee',
			},
			{
				name: 'Get Gas Oracle',
				value: 'getGasOracle',
				description: 'Get gas price recommendations',
				action: 'Get gas oracle',
			},
		],
		default: 'getGasPrice',
	},
];

export const feeFields: INodeProperties[] = [
	{
		displayName: 'To Address',
		name: 'to',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['estimateGas', 'getL1DataFee', 'calculateTotalFee'],
			},
		},
		description: 'Destination address',
	},
	{
		displayName: 'Value (ETH)',
		name: 'value',
		type: 'string',
		default: '0',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['estimateGas', 'calculateTotalFee'],
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
				resource: ['fee'],
				operation: ['estimateGas', 'getL1DataFee', 'calculateTotalFee'],
			},
		},
		description: 'Transaction data (hex)',
	},
	{
		displayName: 'From Address',
		name: 'from',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['estimateGas', 'calculateTotalFee'],
			},
		},
		description: 'Sender address (optional)',
	},
];

// L1 Gas Price Oracle contract on Base
const GAS_PRICE_ORACLE_ADDRESS = '0x420000000000000000000000000000000000000F';
const GAS_PRICE_ORACLE_ABI = [
	'function l1BaseFee() view returns (uint256)',
	'function overhead() view returns (uint256)',
	'function scalar() view returns (uint256)',
	'function decimals() view returns (uint256)',
	'function getL1Fee(bytes _data) view returns (uint256)',
	'function getL1GasUsed(bytes _data) view returns (uint256)',
];

export async function executeFeeOperation(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('baseNetwork');
	const { provider } = getProviderFromCredentials(credentials as unknown as ProviderCredentials);
	const operation = this.getNodeParameter('operation', itemIndex) as string;

	let result: IDataObject;

	switch (operation) {
		case 'getGasPrice': {
			const feeData = await provider.getFeeData();
			result = {
				gasPrice: feeData.gasPrice?.toString(),
				gasPriceGwei: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
			};
			break;
		}

		case 'getFeeData': {
			const feeData = await provider.getFeeData();
			result = {
				gasPrice: feeData.gasPrice?.toString(),
				maxFeePerGas: feeData.maxFeePerGas?.toString(),
				maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
				gasPriceGwei: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
				maxFeePerGasGwei: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
				maxPriorityFeePerGasGwei: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
			};
			break;
		}

		case 'estimateGas': {
			const to = this.getNodeParameter('to', itemIndex) as string;
			const value = this.getNodeParameter('value', itemIndex) as string;
			const data = this.getNodeParameter('data', itemIndex) as string;
			const from = this.getNodeParameter('from', itemIndex) as string;

			const txRequest: ethers.TransactionRequest = {
				to,
				value: ethers.parseEther(value),
				data,
			};

			if (from) {
				txRequest.from = from;
			}

			const gasEstimate = await provider.estimateGas(txRequest);
			const feeData = await provider.getFeeData();

			result = {
				gasEstimate: gasEstimate.toString(),
				gasPrice: feeData.gasPrice?.toString(),
				estimatedCostWei: feeData.gasPrice ? (gasEstimate * feeData.gasPrice).toString() : null,
				estimatedCostEth: feeData.gasPrice ? ethers.formatEther(gasEstimate * feeData.gasPrice) : null,
			};
			break;
		}

		case 'getL1DataFee': {
			const data = this.getNodeParameter('data', itemIndex) as string;

			const gasPriceOracle = new ethers.Contract(
				GAS_PRICE_ORACLE_ADDRESS,
				GAS_PRICE_ORACLE_ABI,
				provider
			);

			const l1Fee = await gasPriceOracle.getL1Fee(data);
			const l1GasUsed = await gasPriceOracle.getL1GasUsed(data);
			const l1BaseFee = await gasPriceOracle.l1BaseFee();

			result = {
				l1Fee: l1Fee.toString(),
				l1FeeEth: ethers.formatEther(l1Fee),
				l1GasUsed: l1GasUsed.toString(),
				l1BaseFee: l1BaseFee.toString(),
				l1BaseFeeGwei: ethers.formatUnits(l1BaseFee, 'gwei'),
			};
			break;
		}

		case 'getBaseFee': {
			const block = await provider.getBlock('latest');

			result = {
				baseFee: block?.baseFeePerGas?.toString() || null,
				baseFeeGwei: block?.baseFeePerGas ? ethers.formatUnits(block.baseFeePerGas, 'gwei') : null,
				blockNumber: block?.number,
			};
			break;
		}

		case 'calculateTotalFee': {
			const to = this.getNodeParameter('to', itemIndex) as string;
			const value = this.getNodeParameter('value', itemIndex) as string;
			const data = this.getNodeParameter('data', itemIndex) as string;
			const from = this.getNodeParameter('from', itemIndex) as string;

			const txRequest: ethers.TransactionRequest = {
				to,
				value: ethers.parseEther(value),
				data,
			};

			if (from) {
				txRequest.from = from;
			}

			// Estimate L2 gas
			const gasEstimate = await provider.estimateGas(txRequest);
			const feeData = await provider.getFeeData();

			// Get L1 data fee
			const gasPriceOracle = new ethers.Contract(
				GAS_PRICE_ORACLE_ADDRESS,
				GAS_PRICE_ORACLE_ABI,
				provider
			);
			const l1Fee = await gasPriceOracle.getL1Fee(data);

			// Calculate total
			const l2Fee = feeData.gasPrice ? gasEstimate * feeData.gasPrice : 0n;
			const totalFee = l2Fee + l1Fee;

			result = {
				l2Gas: gasEstimate.toString(),
				l2Fee: l2Fee.toString(),
				l2FeeEth: ethers.formatEther(l2Fee),
				l1Fee: l1Fee.toString(),
				l1FeeEth: ethers.formatEther(l1Fee),
				totalFee: totalFee.toString(),
				totalFeeEth: ethers.formatEther(totalFee),
				breakdown: {
					l2Percentage: Number((l2Fee * 10000n / totalFee)) / 100,
					l1Percentage: Number((l1Fee * 10000n / totalFee)) / 100,
				},
			};
			break;
		}

		case 'getGasOracle': {
			const feeData = await provider.getFeeData();
			const block = await provider.getBlock('latest');

			// Calculate recommendations based on current data
			const baseFee = block?.baseFeePerGas || 0n;
			const priorityFee = feeData.maxPriorityFeePerGas || 0n;

			result = {
				baseFee: baseFee.toString(),
				baseFeeGwei: ethers.formatUnits(baseFee, 'gwei'),
				recommendations: {
					slow: {
						maxFeePerGas: (baseFee + priorityFee).toString(),
						maxPriorityFeePerGas: priorityFee.toString(),
						maxFeePerGasGwei: ethers.formatUnits(baseFee + priorityFee, 'gwei'),
					},
					standard: {
						maxFeePerGas: (baseFee * 125n / 100n + priorityFee).toString(),
						maxPriorityFeePerGas: (priorityFee * 125n / 100n).toString(),
						maxFeePerGasGwei: ethers.formatUnits(baseFee * 125n / 100n + priorityFee, 'gwei'),
					},
					fast: {
						maxFeePerGas: (baseFee * 150n / 100n + priorityFee * 2n).toString(),
						maxPriorityFeePerGas: (priorityFee * 2n).toString(),
						maxFeePerGasGwei: ethers.formatUnits(baseFee * 150n / 100n + priorityFee * 2n, 'gwei'),
					},
				},
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
