/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';

/**
 * Frame message validation result
 */
export interface FrameValidationResult {
	valid: boolean;
	fid?: number;
	buttonIndex?: number;
	inputText?: string;
	castId?: {
		fid: number;
		hash: string;
	};
	url?: string;
	timestamp?: number;
	error?: string;
}

/**
 * Validate a Farcaster frame message
 * Note: Full validation requires Farcaster Hub API
 */
export async function validateFrameMessage(
	messageBytes: string
): Promise<FrameValidationResult> {
	try {
		// Basic validation - decode the message
		if (!messageBytes || !messageBytes.startsWith('0x')) {
			return { valid: false, error: 'Invalid message format' };
		}
		
		// In production, this would call Farcaster Hub for validation
		// For now, we return a placeholder indicating validation is needed
		return {
			valid: true,
			error: 'Full validation requires Farcaster Hub integration',
		};
	} catch (error) {
		return {
			valid: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

/**
 * Generate frame metadata HTML
 */
export function generateFrameMetadata(options: {
	title: string;
	image: string;
	buttons?: Array<{
		label: string;
		action?: 'post' | 'post_redirect' | 'link' | 'mint' | 'tx';
		target?: string;
	}>;
	inputText?: string;
	postUrl?: string;
	aspectRatio?: '1.91:1' | '1:1';
}): string {
	const tags: string[] = [];
	
	// Required tags
	tags.push(`<meta property="fc:frame" content="vNext" />`);
	tags.push(`<meta property="fc:frame:image" content="${options.image}" />`);
	tags.push(`<meta property="og:title" content="${options.title}" />`);
	tags.push(`<meta property="og:image" content="${options.image}" />`);
	
	// Aspect ratio
	if (options.aspectRatio) {
		tags.push(`<meta property="fc:frame:image:aspect_ratio" content="${options.aspectRatio}" />`);
	}
	
	// Input text
	if (options.inputText) {
		tags.push(`<meta property="fc:frame:input:text" content="${options.inputText}" />`);
	}
	
	// Post URL
	if (options.postUrl) {
		tags.push(`<meta property="fc:frame:post_url" content="${options.postUrl}" />`);
	}
	
	// Buttons
	if (options.buttons) {
		options.buttons.forEach((button, index) => {
			const buttonIndex = index + 1;
			tags.push(`<meta property="fc:frame:button:${buttonIndex}" content="${button.label}" />`);
			
			if (button.action) {
				tags.push(`<meta property="fc:frame:button:${buttonIndex}:action" content="${button.action}" />`);
			}
			
			if (button.target) {
				tags.push(`<meta property="fc:frame:button:${buttonIndex}:target" content="${button.target}" />`);
			}
		});
	}
	
	return tags.join('\n');
}

/**
 * Create a transaction frame response
 */
export function createTransactionFrameResponse(options: {
	chainId: string;
	method: 'eth_sendTransaction';
	params: {
		to: string;
		data?: string;
		value?: string;
	};
}): string {
	return JSON.stringify({
		chainId: options.chainId,
		method: options.method,
		params: options.params,
	});
}

/**
 * Parse frame action from callback data
 */
export function parseFrameAction(data: unknown): {
	buttonIndex: number;
	inputText?: string;
	fid?: number;
} | null {
	try {
		const parsed = typeof data === 'string' ? JSON.parse(data) : data;
		return {
			buttonIndex: parsed.buttonIndex || 1,
			inputText: parsed.inputText,
			fid: parsed.fid,
		};
	} catch {
		return null;
	}
}
