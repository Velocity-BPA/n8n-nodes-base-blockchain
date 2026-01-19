/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { getProviderFromCredentials } from '../../transport/provider';
import { getEASContract, getAttestation } from '../../utils/attestationUtils';

export const attestationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['attestation'] } },
		options: [
			{ name: 'Create Attestation', value: 'createAttestation', description: 'Create a new attestation', action: 'Create attestation' },
			{ name: 'Get Attestation', value: 'getAttestation', description: 'Get attestation by UID', action: 'Get attestation' },
			{ name: 'Verify Attestation', value: 'verifyAttestation', description: 'Verify an attestation', action: 'Verify attestation' },
			{ name: 'Revoke Attestation', value: 'revokeAttestation', description: 'Revoke an attestation', action: 'Revoke attestation' },
		],
		default: 'getAttestation',
	},
];

export const attestationFields: INodeProperties[] = [
	{ displayName: 'Attestation UID', name: 'uid', type: 'string', displayOptions: { show: { resource: ['attestation'], operation: ['getAttestation', 'verifyAttestation', 'revokeAttestation'] } }, default: '' },
	{ displayName: 'Schema UID', name: 'schemaUid', type: 'string', displayOptions: { show: { resource: ['attestation'], operation: ['createAttestation'] } }, default: '' },
	{ displayName: 'Recipient', name: 'recipient', type: 'string', displayOptions: { show: { resource: ['attestation'], operation: ['createAttestation'] } }, default: '' },
	{ displayName: 'Data', name: 'data', type: 'json', displayOptions: { show: { resource: ['attestation'], operation: ['createAttestation'] } }, default: '{}' },
];

export async function executeAttestationOperation(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('baseNetwork');
	const network = credentials.network as string;

	const { provider, signer } = getProviderFromCredentials({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string | undefined,
		privateKey: credentials.privateKey as string | undefined,
		chainId: credentials.chainId as number | undefined,
	});

	let result: IDataObject;

	switch (operation) {
		case 'createAttestation': {
			if (!signer) throw new Error('Private key required');
			const schemaUid = this.getNodeParameter('schemaUid', index) as string;
			const recipient = this.getNodeParameter('recipient', index) as string;
			const data = this.getNodeParameter('data', index) as string;
			const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
			const eas = getEASContract(signer, network);
			const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(['string'], [JSON.stringify(parsedData)]);
			const tx = await eas.getFunction('attest')({ schema: schemaUid, data: { recipient, expirationTime: 0n, revocable: true, refUID: ethers.ZeroHash, data: encodedData, value: 0n } });
			const receipt = await tx.wait();
			result = { hash: tx.hash, status: receipt?.status === 1 ? 'success' : 'failed' };
			break;
		}
		case 'getAttestation': {
			const uid = this.getNodeParameter('uid', index) as string;
			const attestation = await getAttestation(provider, uid, network);
			result = attestation;
			break;
		}
		case 'verifyAttestation': {
			const uid = this.getNodeParameter('uid', index) as string;
			const eas = getEASContract(provider, network);
			const isValid = await eas.isAttestationValid(uid);
			result = { uid, valid: isValid };
			break;
		}
		case 'revokeAttestation': {
			if (!signer) throw new Error('Private key required');
			const uid = this.getNodeParameter('uid', index) as string;
			const attestation = await getAttestation(provider, uid, network);
			const eas = getEASContract(signer, network);
			const tx = await eas.getFunction('revoke')({ schema: attestation.schema, data: { uid, value: 0n } });
			const receipt = await tx.wait();
			result = { uid, hash: tx.hash, status: receipt?.status === 1 ? 'success' : 'failed' };
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
	return [{ json: result }];
}
