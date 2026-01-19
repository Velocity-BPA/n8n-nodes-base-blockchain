/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
} from 'n8n-workflow';

import { ethers } from 'ethers';
import { getProvider, ProviderCredentials } from './transport/provider';

export class BaseTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Base Trigger',
		name: 'baseTrigger',
		icon: 'file:base.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers on Base blockchain events',
		defaults: {
			name: 'Base Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'baseNetwork',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{ name: 'New Block', value: 'newBlock' },
					{ name: 'New Transaction', value: 'newTransaction' },
					{ name: 'ETH Transfer', value: 'ethTransfer' },
					{ name: 'Token Transfer', value: 'tokenTransfer' },
					{ name: 'NFT Transfer', value: 'nftTransfer' },
					{ name: 'Contract Event', value: 'contractEvent' },
				],
				default: 'newBlock',
				description: 'The event to listen for',
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						event: ['newTransaction', 'ethTransfer', 'tokenTransfer', 'nftTransfer'],
					},
				},
				description: 'The address to monitor',
			},
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						event: ['contractEvent', 'tokenTransfer', 'nftTransfer'],
					},
				},
				description: 'The contract address to monitor',
			},
			{
				displayName: 'Event Name',
				name: 'eventName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						event: ['contractEvent'],
					},
				},
				description: 'The event name to listen for (e.g., Transfer)',
			},
			{
				displayName: 'Event ABI',
				name: 'eventAbi',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				displayOptions: {
					show: {
						event: ['contractEvent'],
					},
				},
				description: 'The event ABI in JSON format',
			},
			{
				displayName: 'Polling Interval (seconds)',
				name: 'pollInterval',
				type: 'number',
				default: 15,
				description: 'How often to check for new events',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const event = this.getNodeParameter('event') as string;
		const pollInterval = (this.getNodeParameter('pollInterval') as number) * 1000;

		const credentials = await this.getCredentials('baseNetwork');
		const provider = getProvider(credentials as unknown as ProviderCredentials);

		let lastBlockNumber = await provider.getBlockNumber();

		const checkForEvents = async () => {
			try {
				const currentBlockNumber = await provider.getBlockNumber();

				if (currentBlockNumber <= lastBlockNumber) {
					return;
				}

				for (let blockNum = lastBlockNumber + 1; blockNum <= currentBlockNumber; blockNum++) {
					const block = await provider.getBlock(blockNum, true);
					if (!block) continue;

					switch (event) {
						case 'newBlock':
							this.emit([
								this.helpers.returnJsonArray([{
									blockNumber: block.number,
									blockHash: block.hash,
									timestamp: block.timestamp,
									gasUsed: block.gasUsed?.toString(),
									gasLimit: block.gasLimit?.toString(),
									baseFeePerGas: block.baseFeePerGas?.toString(),
									transactionCount: block.transactions?.length || 0,
								}]),
							]);
							break;

						case 'newTransaction':
						case 'ethTransfer':
							const address = (this.getNodeParameter('address') as string).toLowerCase();
							if (block.prefetchedTransactions) {
								for (const tx of block.prefetchedTransactions) {
									const isRelevant =
										tx.from?.toLowerCase() === address ||
										tx.to?.toLowerCase() === address;

									if (isRelevant) {
										if (event === 'newTransaction' || (event === 'ethTransfer' && tx.value > 0n)) {
											this.emit([
												this.helpers.returnJsonArray([{
													hash: tx.hash,
													from: tx.from,
													to: tx.to,
													value: ethers.formatEther(tx.value),
													blockNumber: tx.blockNumber,
													gasPrice: tx.gasPrice?.toString(),
												}]),
											]);
										}
									}
								}
							}
							break;

						case 'tokenTransfer':
							const tokenContract = this.getNodeParameter('contractAddress') as string;
							const tokenAddress = this.getNodeParameter('address') as string;
							const transferTopic = ethers.id('Transfer(address,address,uint256)');

							const tokenLogs = await provider.getLogs({
								fromBlock: blockNum,
								toBlock: blockNum,
								address: tokenContract || undefined,
								topics: [transferTopic],
							});

							for (const log of tokenLogs) {
								const from = '0x' + log.topics[1]?.slice(26);
								const to = '0x' + log.topics[2]?.slice(26);

								if (!tokenAddress || from.toLowerCase() === tokenAddress.toLowerCase() || to.toLowerCase() === tokenAddress.toLowerCase()) {
									this.emit([
										this.helpers.returnJsonArray([{
											contract: log.address,
											from,
											to,
											value: BigInt(log.data).toString(),
											blockNumber: log.blockNumber,
											transactionHash: log.transactionHash,
										}]),
									]);
								}
							}
							break;

						case 'nftTransfer':
							const nftContract = this.getNodeParameter('contractAddress') as string;
							const nftAddress = this.getNodeParameter('address') as string;
							const erc721TransferTopic = ethers.id('Transfer(address,address,uint256)');

							const nftLogs = await provider.getLogs({
								fromBlock: blockNum,
								toBlock: blockNum,
								address: nftContract || undefined,
								topics: [erc721TransferTopic],
							});

							for (const log of nftLogs) {
								if (log.topics.length === 4) {
									const from = '0x' + log.topics[1]?.slice(26);
									const to = '0x' + log.topics[2]?.slice(26);
									const tokenId = BigInt(log.topics[3] || '0').toString();

									if (!nftAddress || from.toLowerCase() === nftAddress.toLowerCase() || to.toLowerCase() === nftAddress.toLowerCase()) {
										this.emit([
											this.helpers.returnJsonArray([{
												contract: log.address,
												from,
												to,
												tokenId,
												blockNumber: log.blockNumber,
												transactionHash: log.transactionHash,
											}]),
										]);
									}
								}
							}
							break;

						case 'contractEvent':
							const contractAddr = this.getNodeParameter('contractAddress') as string;
							const eventName = this.getNodeParameter('eventName') as string;
							const eventAbiStr = this.getNodeParameter('eventAbi') as string;

							let eventTopic: string;
							if (eventAbiStr) {
								const eventAbi = JSON.parse(eventAbiStr);
								const iface = new ethers.Interface([eventAbi]);
								eventTopic = iface.getEvent(eventName)?.topicHash || '';
							} else {
								eventTopic = ethers.id(`${eventName}()`);
							}

							const contractLogs = await provider.getLogs({
								fromBlock: blockNum,
								toBlock: blockNum,
								address: contractAddr,
								topics: eventTopic ? [eventTopic] : undefined,
							});

							for (const log of contractLogs) {
								this.emit([
									this.helpers.returnJsonArray([{
										address: log.address,
										topics: log.topics,
										data: log.data,
										blockNumber: log.blockNumber,
										transactionHash: log.transactionHash,
										logIndex: log.index,
									}]),
								]);
							}
							break;
					}
				}

				lastBlockNumber = currentBlockNumber;
			} catch (error) {
				console.error('Base Trigger error:', error);
			}
		};

		const intervalId = setInterval(checkForEvents, pollInterval);

		// Initial check
		await checkForEvents();

		const closeFunction = async () => {
			clearInterval(intervalId);
		};

		return {
			closeFunction,
		};
	}
}
