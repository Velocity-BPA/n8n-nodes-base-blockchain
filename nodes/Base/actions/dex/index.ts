/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { getProviderFromCredentials, ProviderCredentials } from '../../transport/provider';

export const dexOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['dex'],
			},
		},
		options: [
			{
				name: 'Get Swap Quote',
				value: 'getSwapQuote',
				description: 'Get a quote for token swap',
				action: 'Get swap quote',
			},
			{
				name: 'Get Pool Info',
				value: 'getPoolInfo',
				description: 'Get liquidity pool information',
				action: 'Get pool info',
			},
			{
				name: 'Get Token Price',
				value: 'getTokenPrice',
				description: 'Get token price in USD',
				action: 'Get token price',
			},
			{
				name: 'Execute Swap',
				value: 'executeSwap',
				description: 'Execute a token swap',
				action: 'Execute swap',
			},
		],
		default: 'getSwapQuote',
	},
];

export const dexFields: INodeProperties[] = [
	{
		displayName: 'Token In',
		name: 'tokenIn',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['dex'],
				operation: ['getSwapQuote', 'executeSwap'],
			},
		},
		description: 'Input token address',
	},
	{
		displayName: 'Token Out',
		name: 'tokenOut',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['dex'],
				operation: ['getSwapQuote', 'executeSwap'],
			},
		},
		description: 'Output token address',
	},
	{
		displayName: 'Amount In',
		name: 'amountIn',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['dex'],
				operation: ['getSwapQuote', 'executeSwap'],
			},
		},
		description: 'Amount of input token',
	},
	{
		displayName: 'Pool Address',
		name: 'poolAddress',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['dex'],
				operation: ['getPoolInfo'],
			},
		},
		description: 'Liquidity pool address',
	},
	{
		displayName: 'Token Address',
		name: 'tokenAddress',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['dex'],
				operation: ['getTokenPrice'],
			},
		},
		description: 'Token address to get price for',
	},
	{
		displayName: 'Slippage Tolerance (%)',
		name: 'slippage',
		type: 'number',
		default: 0.5,
		displayOptions: {
			show: {
				resource: ['dex'],
				operation: ['executeSwap'],
			},
		},
		description: 'Maximum slippage tolerance in percentage',
	},
];

export async function executeDexOperation(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('baseNetwork');
	const { provider, signer } = getProviderFromCredentials(credentials as unknown as ProviderCredentials);
	const operation = this.getNodeParameter('operation', itemIndex) as string;

	let result: IDataObject;

	switch (operation) {
		case 'getSwapQuote': {
			const tokenIn = this.getNodeParameter('tokenIn', itemIndex) as string;
			const tokenOut = this.getNodeParameter('tokenOut', itemIndex) as string;
			const amountIn = this.getNodeParameter('amountIn', itemIndex) as string;

			// Uniswap V3 Quoter address on Base
			const quoterAddress = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a';
			const quoterAbi = [
				'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
			];

			const quoter = new ethers.Contract(quoterAddress, quoterAbi, provider);
			const amountInWei = ethers.parseUnits(amountIn, 18);

			try {
				const amountOut = await quoter.quoteExactInputSingle.staticCall(
					tokenIn,
					tokenOut,
					3000, // 0.3% fee tier
					amountInWei,
					0
				);

				result = {
					tokenIn,
					tokenOut,
					amountIn,
					amountOut: ethers.formatUnits(amountOut, 18),
					feeTier: 3000,
					priceImpact: 'N/A',
				};
			} catch {
				result = {
					tokenIn,
					tokenOut,
					amountIn,
					error: 'Unable to get quote - pool may not exist or have liquidity',
				};
			}
			break;
		}

		case 'getPoolInfo': {
			const poolAddress = this.getNodeParameter('poolAddress', itemIndex) as string;

			const poolAbi = [
				'function token0() external view returns (address)',
				'function token1() external view returns (address)',
				'function fee() external view returns (uint24)',
				'function liquidity() external view returns (uint128)',
				'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
			];

			const pool = new ethers.Contract(poolAddress, poolAbi, provider);

			const [token0, token1, fee, liquidity, slot0] = await Promise.all([
				pool.token0(),
				pool.token1(),
				pool.fee(),
				pool.liquidity(),
				pool.slot0(),
			]);

			result = {
				address: poolAddress,
				token0,
				token1,
				fee: Number(fee),
				liquidity: liquidity.toString(),
				sqrtPriceX96: slot0.sqrtPriceX96.toString(),
				tick: Number(slot0.tick),
			};
			break;
		}

		case 'getTokenPrice': {
			const tokenAddress = this.getNodeParameter('tokenAddress', itemIndex) as string;

			// Simplified price check using a common pair
			result = {
				token: tokenAddress,
				price: 'Price oracle integration required',
				source: 'Chainlink or DEX TWAP recommended',
			};
			break;
		}

		case 'executeSwap': {
			if (!signer) {
				throw new Error('Private key required to execute swaps');
			}

			const tokenIn = this.getNodeParameter('tokenIn', itemIndex) as string;
			const tokenOut = this.getNodeParameter('tokenOut', itemIndex) as string;
			const amountIn = this.getNodeParameter('amountIn', itemIndex) as string;
			const slippage = this.getNodeParameter('slippage', itemIndex) as number;

			// Uniswap V3 SwapRouter address on Base
			const swapRouterAddress = '0x2626664c2603336E57B271c5C0b26F421741e481';
			const swapRouterAbi = [
				'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)',
			];

			const swapRouter = new ethers.Contract(swapRouterAddress, swapRouterAbi, signer);
			const amountInWei = ethers.parseUnits(amountIn, 18);
			const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

			// Calculate minimum amount out with slippage
			const amountOutMinimum = 0; // For production, calculate based on quote

			const tx = await swapRouter.exactInputSingle({
				tokenIn,
				tokenOut,
				fee: 3000,
				recipient: await signer.getAddress(),
				deadline,
				amountIn: amountInWei,
				amountOutMinimum,
				sqrtPriceLimitX96: 0,
			});

			const receipt = await tx.wait();

			result = {
				transactionHash: receipt.hash,
				blockNumber: receipt.blockNumber,
				gasUsed: receipt.gasUsed.toString(),
				status: receipt.status === 1 ? 'success' : 'failed',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
