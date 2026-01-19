/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import axios from 'axios';

export const farcasterOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['farcaster'],
			},
		},
		options: [
			{
				name: 'Get Cast',
				value: 'getCast',
				description: 'Get a cast by hash',
				action: 'Get cast',
			},
			{
				name: 'Get User',
				value: 'getUser',
				description: 'Get user information by FID',
				action: 'Get user',
			},
			{
				name: 'Get User by Username',
				value: 'getUserByUsername',
				description: 'Get user information by username',
				action: 'Get user by username',
			},
			{
				name: 'Validate Frame Message',
				value: 'validateFrameMessage',
				description: 'Validate a Farcaster frame message',
				action: 'Validate frame message',
			},
			{
				name: 'Get Casts by FID',
				value: 'getCastsByFid',
				description: 'Get casts by user FID',
				action: 'Get casts by FID',
			},
			{
				name: 'Get Channel',
				value: 'getChannel',
				description: 'Get channel information',
				action: 'Get channel',
			},
			{
				name: 'Get Followers',
				value: 'getFollowers',
				description: 'Get followers of a user',
				action: 'Get followers',
			},
			{
				name: 'Get Following',
				value: 'getFollowing',
				description: 'Get users being followed',
				action: 'Get following',
			},
		],
		default: 'getCast',
	},
];

export const farcasterFields: INodeProperties[] = [
	{
		displayName: 'Cast Hash',
		name: 'castHash',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['farcaster'],
				operation: ['getCast'],
			},
		},
		description: 'The hash of the cast to retrieve',
	},
	{
		displayName: 'FID',
		name: 'fid',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['farcaster'],
				operation: ['getUser', 'getCastsByFid', 'getFollowers', 'getFollowing'],
			},
		},
		description: 'The Farcaster ID of the user',
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['farcaster'],
				operation: ['getUserByUsername'],
			},
		},
		description: 'The username to look up',
	},
	{
		displayName: 'Frame Message',
		name: 'frameMessage',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['farcaster'],
				operation: ['validateFrameMessage'],
			},
		},
		description: 'The frame message to validate (JSON)',
	},
	{
		displayName: 'Channel ID',
		name: 'channelId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['farcaster'],
				operation: ['getChannel'],
			},
		},
		description: 'The channel ID to look up',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 25,
		displayOptions: {
			show: {
				resource: ['farcaster'],
				operation: ['getCastsByFid', 'getFollowers', 'getFollowing'],
			},
		},
		description: 'Maximum number of results to return',
	},
];

const NEYNAR_API_URL = 'https://api.neynar.com/v2/farcaster';

export async function executeFarcasterOperation(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', itemIndex) as string;
	let result: IDataObject;

	// Note: For production, use Neynar API key from credentials
	const apiKey = 'NEYNAR_API_DOCS'; // Demo key for basic operations

	const headers = {
		'accept': 'application/json',
		'api_key': apiKey,
	};

	switch (operation) {
		case 'getCast': {
			const castHash = this.getNodeParameter('castHash', itemIndex) as string;

			try {
				const response = await axios.get(
					`${NEYNAR_API_URL}/cast?identifier=${castHash}&type=hash`,
					{ headers }
				);
				result = response.data.cast as IDataObject;
			} catch (error) {
				result = {
					error: 'Failed to fetch cast',
					hash: castHash,
					message: (error as Error).message,
				};
			}
			break;
		}

		case 'getUser': {
			const fid = this.getNodeParameter('fid', itemIndex) as number;

			try {
				const response = await axios.get(
					`${NEYNAR_API_URL}/user/bulk?fids=${fid}`,
					{ headers }
				);
				result = response.data.users?.[0] as IDataObject || { error: 'User not found' };
			} catch (error) {
				result = {
					error: 'Failed to fetch user',
					fid,
					message: (error as Error).message,
				};
			}
			break;
		}

		case 'getUserByUsername': {
			const username = this.getNodeParameter('username', itemIndex) as string;

			try {
				const response = await axios.get(
					`${NEYNAR_API_URL}/user/by_username?username=${username}`,
					{ headers }
				);
				result = response.data.user as IDataObject;
			} catch (error) {
				result = {
					error: 'Failed to fetch user',
					username,
					message: (error as Error).message,
				};
			}
			break;
		}

		case 'validateFrameMessage': {
			const frameMessage = this.getNodeParameter('frameMessage', itemIndex) as string;

			try {
				const messageData = JSON.parse(frameMessage);
				const response = await axios.post(
					`${NEYNAR_API_URL}/frame/validate`,
					{ message_bytes_in_hex: messageData.trustedData?.messageBytes },
					{ headers: { ...headers, 'content-type': 'application/json' } }
				);
				result = {
					valid: response.data.valid,
					action: response.data.action,
				};
			} catch (error) {
				result = {
					valid: false,
					error: 'Validation failed',
					message: (error as Error).message,
				};
			}
			break;
		}

		case 'getCastsByFid': {
			const fid = this.getNodeParameter('fid', itemIndex) as number;
			const limit = this.getNodeParameter('limit', itemIndex) as number;

			try {
				const response = await axios.get(
					`${NEYNAR_API_URL}/feed/user/${fid}/casts?limit=${limit}`,
					{ headers }
				);
				result = {
					casts: response.data.casts,
					count: response.data.casts?.length || 0,
				};
			} catch (error) {
				result = {
					error: 'Failed to fetch casts',
					fid,
					message: (error as Error).message,
				};
			}
			break;
		}

		case 'getChannel': {
			const channelId = this.getNodeParameter('channelId', itemIndex) as string;

			try {
				const response = await axios.get(
					`${NEYNAR_API_URL}/channel?id=${channelId}`,
					{ headers }
				);
				result = response.data.channel as IDataObject;
			} catch (error) {
				result = {
					error: 'Failed to fetch channel',
					channelId,
					message: (error as Error).message,
				};
			}
			break;
		}

		case 'getFollowers': {
			const fid = this.getNodeParameter('fid', itemIndex) as number;
			const limit = this.getNodeParameter('limit', itemIndex) as number;

			try {
				const response = await axios.get(
					`${NEYNAR_API_URL}/followers?fid=${fid}&limit=${limit}`,
					{ headers }
				);
				result = {
					followers: response.data.users,
					count: response.data.users?.length || 0,
				};
			} catch (error) {
				result = {
					error: 'Failed to fetch followers',
					fid,
					message: (error as Error).message,
				};
			}
			break;
		}

		case 'getFollowing': {
			const fid = this.getNodeParameter('fid', itemIndex) as number;
			const limit = this.getNodeParameter('limit', itemIndex) as number;

			try {
				const response = await axios.get(
					`${NEYNAR_API_URL}/following?fid=${fid}&limit=${limit}`,
					{ headers }
				);
				result = {
					following: response.data.users,
					count: response.data.users?.length || 0,
				};
			} catch (error) {
				result = {
					error: 'Failed to fetch following',
					fid,
					message: (error as Error).message,
				};
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
