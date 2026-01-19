/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';
import { EAS_ABI, SCHEMA_REGISTRY_ABI } from '../constants/schemas';
import { BASE_CONTRACTS } from '../constants/contracts';

/**
 * Get EAS contract instance
 */
export function getEASContract(signerOrProvider: ethers.Signer | ethers.Provider, network: string = 'mainnet') {
	const contracts = BASE_CONTRACTS[network as keyof typeof BASE_CONTRACTS] || BASE_CONTRACTS.mainnet;
	return new ethers.Contract(contracts.eas, EAS_ABI, signerOrProvider);
}

/**
 * Get Schema Registry contract instance
 */
export function getSchemaRegistry(signerOrProvider: ethers.Signer | ethers.Provider, network: string = 'mainnet') {
	const contracts = BASE_CONTRACTS[network as keyof typeof BASE_CONTRACTS] || BASE_CONTRACTS.mainnet;
	return new ethers.Contract(contracts.easSchemaRegistry, SCHEMA_REGISTRY_ABI, signerOrProvider);
}

/**
 * Encode attestation data
 */
export function encodeAttestationData(schema: string, data: Record<string, unknown>): string {
	// Parse schema string to get types
	const schemaTypes = parseSchemaTypes(schema);
	const values = schemaTypes.map(({ name }) => data[name]);
	const types = schemaTypes.map(({ type }) => type);
	
	const abiCoder = ethers.AbiCoder.defaultAbiCoder();
	return abiCoder.encode(types, values);
}

/**
 * Decode attestation data
 */
export function decodeAttestationData(schema: string, data: string): Record<string, unknown> {
	const schemaTypes = parseSchemaTypes(schema);
	const types = schemaTypes.map(({ type }) => type);
	
	const abiCoder = ethers.AbiCoder.defaultAbiCoder();
	const decoded = abiCoder.decode(types, data);
	
	const result: Record<string, unknown> = {};
	schemaTypes.forEach(({ name }, index) => {
		const value = decoded[index];
		result[name] = typeof value === 'bigint' ? value.toString() : value;
	});
	
	return result;
}

/**
 * Parse schema string into types array
 */
function parseSchemaTypes(schema: string): Array<{ type: string; name: string }> {
	return schema.split(',').map(field => {
		const parts = field.trim().split(' ');
		return {
			type: parts[0],
			name: parts[1] || parts[0],
		};
	});
}

/**
 * Check if an attestation is valid
 */
export async function isAttestationValid(
	provider: ethers.Provider,
	uid: string,
	network: string = 'mainnet'
): Promise<boolean> {
	const eas = getEASContract(provider, network);
	return await eas.isAttestationValid(uid);
}

/**
 * Get attestation by UID
 */
export async function getAttestation(
	provider: ethers.Provider,
	uid: string,
	network: string = 'mainnet'
) {
	const eas = getEASContract(provider, network);
	const attestation = await eas.getAttestation(uid);
	
	return {
		uid: attestation.uid,
		schema: attestation.schema,
		time: attestation.time.toString(),
		expirationTime: attestation.expirationTime.toString(),
		revocationTime: attestation.revocationTime.toString(),
		refUID: attestation.refUID,
		recipient: attestation.recipient,
		attester: attestation.attester,
		revocable: attestation.revocable,
		data: attestation.data,
	};
}
