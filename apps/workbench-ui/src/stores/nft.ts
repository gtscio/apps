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
 * @param issuer The issuer of the nft.
 * @param tag The tag of the nft.
 * @param immutableMetadata The immutable data of the nft.
 * @returns The nft information or an error if one occurred.
 */
export async function nftMint(
	issuer: string,
	tag: string,
	immutableMetadata?: unknown
): Promise<
	| {
			error?: string;
			nftId?: string;
	  }
	| undefined
> {
	if (Is.object(nftClient)) {
		try {
			const nftId = await nftClient.mint(issuer, tag, immutableMetadata);
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
 * Verify an nft data.
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
