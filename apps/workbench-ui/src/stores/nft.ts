// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import { NftClient } from "@twin.org/nft-rest-client";

let nftClient: NftClient | undefined;

/**
 * Initialise the nft.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	nftClient = new NftClient({
		endpoint: apiUrl
	});
}

/**
 * Mint NFT.
 * @param tag The tag of the nft.
 * @param immutableMetadata The immutable metadata of the nft.
 * @param metadata The metadata of the nft.
 * @param namespace The namespace of the nft.
 * @returns The nft information or an error if one occurred.
 */
export async function nftMint(
	tag: string,
	immutableMetadata?: unknown,
	metadata?: unknown,
	namespace?: string
): Promise<
	| {
			error?: string;
			nftId?: string;
	  }
	| undefined
> {
	if (Is.object(nftClient)) {
		try {
			const nftId = await nftClient.mint(tag, immutableMetadata, metadata, namespace);
			return {
				nftId
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Verify a nft data.
 * @param nftId The id of the nft.
 * @returns The id of the nft or an error if one occurred.
 */
export async function nftResolve(nftId: string): Promise<
	| {
			issuer?: string;
			owner?: string;
			tag?: string;
			immutableMetadata?: unknown;
			metadata?: unknown;
			error?: string;
	  }
	| undefined
> {
	if (Is.object(nftClient)) {
		try {
			const result = await nftClient.resolve(nftId);
			return result;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Burn a nft data.
 * @param nftId The id of the nft.
 * @returns Undefined or an error if one occurred.
 */
export async function nftBurn(nftId: string): Promise<undefined | { error: string }> {
	if (Is.object(nftClient)) {
		try {
			await nftClient.burn(nftId);
			return undefined;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Transfer a nft data.
 * @param nftId The id of the nft.
 * @param recipientIdentity The recipient identity.
 * @param recipientAddress The recipient address.
 * @param metadata The metadata of the nft.
 * @returns Undefined or an error if one occurred.
 */
export async function nftTransfer(
	nftId: string,
	recipientIdentity: string,
	recipientAddress: string,
	metadata?: unknown
): Promise<undefined | { error: string }> {
	if (Is.object(nftClient)) {
		try {
			await nftClient.transfer(nftId, recipientIdentity, recipientAddress, metadata);
			return undefined;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
