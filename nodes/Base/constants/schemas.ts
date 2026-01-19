/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Common EAS Schema UIDs on Base
export const COMMON_SCHEMAS = {
	mainnet: {
		// Basic attestation schemas
		simpleAttestation: '0x0000000000000000000000000000000000000000000000000000000000000001',
		// Coinbase Verified Account
		coinbaseVerifiedAccount: '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9',
		// ENS
		ensName: '0x44d562ac1d7cd77e232978687fea027ace48f719cf1d58c7888e509663bb87fc',
	},
	sepolia: {
		simpleAttestation: '0x0000000000000000000000000000000000000000000000000000000000000001',
	},
} as const;

// EAS Contract ABIs
export const EAS_ABI = [
	'function attest(tuple(bytes32 schema, tuple(address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data) request) payable returns (bytes32)',
	'function attestByDelegation(tuple(bytes32 schema, tuple(address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data, tuple(uint8 v, bytes32 r, bytes32 s) signature, address attester, uint64 deadline) delegatedRequest) payable returns (bytes32)',
	'function revoke(tuple(bytes32 schema, tuple(bytes32 uid, uint256 value) data) request) payable',
	'function revokeByDelegation(tuple(bytes32 schema, tuple(bytes32 uid, uint256 value) data, tuple(uint8 v, bytes32 r, bytes32 s) signature, address revoker, uint64 deadline) delegatedRequest) payable',
	'function getAttestation(bytes32 uid) view returns (tuple(bytes32 uid, bytes32 schema, uint64 time, uint64 expirationTime, uint64 revocationTime, bytes32 refUID, address recipient, address attester, bool revocable, bytes data))',
	'function isAttestationValid(bytes32 uid) view returns (bool)',
	'function getTimestamp(bytes32 data) view returns (uint64)',
	'event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)',
	'event Revoked(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)',
];

export const SCHEMA_REGISTRY_ABI = [
	'function register(string schema, address resolver, bool revocable) returns (bytes32)',
	'function getSchema(bytes32 uid) view returns (tuple(bytes32 uid, address resolver, bool revocable, string schema))',
	'event Registered(bytes32 indexed uid, address indexed registerer)',
];
