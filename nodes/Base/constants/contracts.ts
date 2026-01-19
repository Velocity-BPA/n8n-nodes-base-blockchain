/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Multicall3 contract address (same on all EVM chains)
export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

// Base-specific contracts
export const BASE_CONTRACTS = {
	mainnet: {
		// Core system contracts
		l2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
		l2StandardBridge: '0x4200000000000000000000000000000000000010',
		l2ToL1MessagePasser: '0x4200000000000000000000000000000000000016',
		gasPriceOracle: '0x420000000000000000000000000000000000000F',
		l1Block: '0x4200000000000000000000000000000000000015',
		
		// Basenames
		basenameRegistrar: '0x4cCb0720840A3c8A4A07f0E0cECb0E2A40e8b5F6',
		basenameResolver: '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD',
		
		// EAS (Ethereum Attestation Service)
		eas: '0x4200000000000000000000000000000000000021',
		easSchemaRegistry: '0x4200000000000000000000000000000000000020',
		
		// DEX
		uniswapV3Factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
		uniswapV3Router: '0x2626664c2603336E57B271c5C0b26F421741e481',
		uniswapQuoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
		
		// Aerodrome
		aerodromeRouter: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
		
		// Safe
		safeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
		safeSingleton: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
	},
	sepolia: {
		// Core system contracts
		l2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
		l2StandardBridge: '0x4200000000000000000000000000000000000010',
		l2ToL1MessagePasser: '0x4200000000000000000000000000000000000016',
		gasPriceOracle: '0x420000000000000000000000000000000000000F',
		l1Block: '0x4200000000000000000000000000000000000015',
		
		// Basenames (testnet)
		basenameRegistrar: '0x49aE3cC2e3AA768B1e5654f5D3C6002144A59581',
		basenameResolver: '0x6533C94869D28fAA8dF77cc63f9e2c2b44D7d6e4',
		
		// EAS
		eas: '0x4200000000000000000000000000000000000021',
		easSchemaRegistry: '0x4200000000000000000000000000000000000020',
		
		// DEX (testnet may have different addresses)
		uniswapV3Factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
		uniswapV3Router: '0x2626664c2603336E57B271c5C0b26F421741e481',
		uniswapQuoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
		
		// Safe
		safeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
		safeSingleton: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
	},
} as const;

// Common ABIs
export const ERC20_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address owner) view returns (uint256)',
	'function transfer(address to, uint256 amount) returns (bool)',
	'function allowance(address owner, address spender) view returns (uint256)',
	'function approve(address spender, uint256 amount) returns (bool)',
	'function transferFrom(address from, address to, uint256 amount) returns (bool)',
	'event Transfer(address indexed from, address indexed to, uint256 value)',
	'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export const ERC721_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function tokenURI(uint256 tokenId) view returns (string)',
	'function balanceOf(address owner) view returns (uint256)',
	'function ownerOf(uint256 tokenId) view returns (address)',
	'function safeTransferFrom(address from, address to, uint256 tokenId)',
	'function transferFrom(address from, address to, uint256 tokenId)',
	'function approve(address to, uint256 tokenId)',
	'function setApprovalForAll(address operator, bool approved)',
	'function getApproved(uint256 tokenId) view returns (address)',
	'function isApprovedForAll(address owner, address operator) view returns (bool)',
	'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
	'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
];

export const ERC1155_ABI = [
	'function uri(uint256 id) view returns (string)',
	'function balanceOf(address account, uint256 id) view returns (uint256)',
	'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
	'function setApprovalForAll(address operator, bool approved)',
	'function isApprovedForAll(address account, address operator) view returns (bool)',
	'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
	'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
	'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
	'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
];

export const GAS_PRICE_ORACLE_ABI = [
	'function gasPrice() view returns (uint256)',
	'function baseFee() view returns (uint256)',
	'function overhead() view returns (uint256)',
	'function scalar() view returns (uint256)',
	'function l1BaseFee() view returns (uint256)',
	'function decimals() view returns (uint256)',
	'function getL1Fee(bytes _data) view returns (uint256)',
	'function getL1GasUsed(bytes _data) view returns (uint256)',
];
