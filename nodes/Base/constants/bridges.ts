/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const BRIDGE_CONTRACTS = {
	mainnet: {
		l1StandardBridge: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
		l2StandardBridge: '0x4200000000000000000000000000000000000010',
		optimismPortal: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
		l2ToL1MessagePasser: '0x4200000000000000000000000000000000000016',
		l1CrossDomainMessenger: '0x866E82a600A1414e583f7F13623F1aC5d58b0Afa',
		l2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
	},
	sepolia: {
		l1StandardBridge: '0xfd0Bf71F60660E2f608ed56e1659C450eB113120',
		l2StandardBridge: '0x4200000000000000000000000000000000000010',
		optimismPortal: '0x49f53e41452C74589E85cA1677426Ba426459e85',
		l2ToL1MessagePasser: '0x4200000000000000000000000000000000000016',
		l1CrossDomainMessenger: '0xC34855F4De64F1840e5686e64278da901e261f20',
		l2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
	},
} as const;

export const L1_STANDARD_BRIDGE_ABI = [
	'function depositETH(uint32 _minGasLimit, bytes _extraData) payable',
	'function depositETHTo(address _to, uint32 _minGasLimit, bytes _extraData) payable',
	'function depositERC20(address _l1Token, address _l2Token, uint256 _amount, uint32 _minGasLimit, bytes _extraData)',
	'function depositERC20To(address _l1Token, address _l2Token, address _to, uint256 _amount, uint32 _minGasLimit, bytes _extraData)',
	'function finalizeETHWithdrawal(address _from, address _to, uint256 _amount, bytes _extraData)',
	'function finalizeERC20Withdrawal(address _l1Token, address _l2Token, address _from, address _to, uint256 _amount, bytes _extraData)',
	'event ETHDepositInitiated(address indexed _from, address indexed _to, uint256 _amount, bytes _extraData)',
	'event ERC20DepositInitiated(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _extraData)',
];

export const L2_STANDARD_BRIDGE_ABI = [
	'function withdraw(address _l2Token, uint256 _amount, uint32 _minGasLimit, bytes _extraData)',
	'function withdrawTo(address _l2Token, address _to, uint256 _amount, uint32 _minGasLimit, bytes _extraData)',
	'event WithdrawalInitiated(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _extraData)',
];

export const OPTIMISM_PORTAL_ABI = [
	'function proveWithdrawalTransaction(tuple(uint256 nonce, address sender, address target, uint256 value, uint256 gasLimit, bytes data) _tx, uint256 _l2OutputIndex, tuple(bytes32 version, bytes32 stateRoot, bytes32 messagePasserStorageRoot, bytes32 latestBlockhash) _outputRootProof, bytes[] _withdrawalProof)',
	'function finalizeWithdrawalTransaction(tuple(uint256 nonce, address sender, address target, uint256 value, uint256 gasLimit, bytes data) _tx)',
	'function isOutputFinalized(uint256 _l2OutputIndex) view returns (bool)',
	'event WithdrawalProven(bytes32 indexed withdrawalHash, address indexed from, address indexed to)',
	'event WithdrawalFinalized(bytes32 indexed withdrawalHash, bool success)',
];
