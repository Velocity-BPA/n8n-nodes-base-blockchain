/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';
import {
	BRIDGE_CONTRACTS,
	L1_STANDARD_BRIDGE_ABI,
	L2_STANDARD_BRIDGE_ABI,
	OPTIMISM_PORTAL_ABI,
} from '../constants/bridges';

export interface BridgeConfig {
	network: 'mainnet' | 'sepolia';
	l1Provider?: ethers.Provider;
	l2Provider: ethers.Provider;
	l1Signer?: ethers.Signer;
	l2Signer?: ethers.Signer;
}

export class BridgeClient {
	private network: 'mainnet' | 'sepolia';
	private contracts: {
		l1StandardBridge: string;
		l2StandardBridge: string;
		optimismPortal: string;
		l2ToL1MessagePasser: string;
		l1CrossDomainMessenger: string;
		l2CrossDomainMessenger: string;
	};
	private l1Provider?: ethers.Provider;
	private l2Provider: ethers.Provider;
	private l1Signer?: ethers.Signer;
	private l2Signer?: ethers.Signer;

	constructor(config: BridgeConfig) {
		this.network = config.network;
		this.contracts = BRIDGE_CONTRACTS[config.network];
		this.l1Provider = config.l1Provider;
		this.l2Provider = config.l2Provider;
		this.l1Signer = config.l1Signer;
		this.l2Signer = config.l2Signer;
	}

	/**
	 * Get L1 Standard Bridge contract
	 */
	getL1Bridge(signerOrProvider?: ethers.Signer | ethers.Provider) {
		const provider = signerOrProvider || this.l1Signer || this.l1Provider;
		if (!provider) {
			throw new Error('L1 provider or signer required');
		}
		return new ethers.Contract(
			this.contracts.l1StandardBridge,
			L1_STANDARD_BRIDGE_ABI,
			provider
		);
	}

	/**
	 * Get L2 Standard Bridge contract
	 */
	getL2Bridge(signerOrProvider?: ethers.Signer | ethers.Provider) {
		const provider = signerOrProvider || this.l2Signer || this.l2Provider;
		return new ethers.Contract(
			this.contracts.l2StandardBridge,
			L2_STANDARD_BRIDGE_ABI,
			provider
		);
	}

	/**
	 * Get Optimism Portal contract (for proving/finalizing withdrawals)
	 */
	getOptimismPortal(signerOrProvider?: ethers.Signer | ethers.Provider) {
		const provider = signerOrProvider || this.l1Signer || this.l1Provider;
		if (!provider) {
			throw new Error('L1 provider or signer required');
		}
		return new ethers.Contract(
			this.contracts.optimismPortal,
			OPTIMISM_PORTAL_ABI,
			provider
		);
	}

	/**
	 * Deposit ETH from L1 to L2
	 */
	async depositETH(
		to: string,
		amount: bigint,
		minGasLimit: number = 200000
	): Promise<ethers.TransactionResponse> {
		if (!this.l1Signer) {
			throw new Error('L1 signer required for deposits');
		}

		const bridge = this.getL1Bridge(this.l1Signer);
		return bridge.depositETHTo(to, minGasLimit, '0x', { value: amount });
	}

	/**
	 * Withdraw ETH from L2 to L1
	 */
	async withdrawETH(
		to: string,
		amount: bigint,
		minGasLimit: number = 0
	): Promise<ethers.TransactionResponse> {
		if (!this.l2Signer) {
			throw new Error('L2 signer required for withdrawals');
		}

		const bridge = this.getL2Bridge(this.l2Signer);
		// ETH address on L2
		const l2EthAddress = '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000';
		return bridge.withdrawTo(l2EthAddress, to, amount, minGasLimit, '0x');
	}

	/**
	 * Get bridge contract addresses
	 */
	getContractAddresses() {
		return {
			l1StandardBridge: this.contracts.l1StandardBridge,
			l2StandardBridge: this.contracts.l2StandardBridge,
			optimismPortal: this.contracts.optimismPortal,
			l2ToL1MessagePasser: this.contracts.l2ToL1MessagePasser,
		};
	}

	/**
	 * Estimate deposit gas
	 */
	async estimateDepositGas(amount: bigint): Promise<bigint> {
		if (!this.l1Provider) {
			throw new Error('L1 provider required');
		}

		// Rough estimate for ETH deposit
		return 150000n;
	}

	/**
	 * Estimate withdrawal gas
	 */
	async estimateWithdrawalGas(amount: bigint): Promise<bigint> {
		// Rough estimate for ETH withdrawal initiation
		return 200000n;
	}
}

/**
 * Create bridge client from config
 */
export function createBridgeClient(config: BridgeConfig): BridgeClient {
	return new BridgeClient(config);
}
