// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, StringHelper, Urn } from "@twin.org/core";
import { Bech32 } from "@twin.org/crypto";
let explorerUrl = "";

/**
 * Initialise the IOTA store.
 * @param envExplorerUrl The url for explorer.
 */
export async function init(envExplorerUrl: string): Promise<void> {
	explorerUrl = StringHelper.trimTrailingSlashes(envExplorerUrl);
}

/**
 * Create an identity explorer URL.
 * @param identity The identity to create the url for.
 * @returns The identity url.
 */
export function createExplorerIdentityUrl(identity: string): string {
	const parts = identity.split(":");
	const hrp = parts[2];
	const aliasId = parts[3];
	return createExplorerUrl(`addr/${aliasIdToBech32(hrp, aliasId)}?tab=DID`);
}

/**
 * Create an nft explorer URL.
 * @param nftId The nft id to create the url for.
 * @returns The nft id url.
 */
export function createExplorerNftUrl(nftId: string): string {
	const parts = nftId.split(":");
	const hrp = parts[2];
	const aliasId = parts[3];
	return createExplorerUrl(`addr/${nftIdToBech32(hrp, aliasId)}`);
}

/**
 * Create a transaction explorer URL.
 * @param transactionId The transaction id to create the url for.
 * @returns The transaction id url.
 */
export function createExplorerTransactionUrl(transactionId: string): string {
	return createExplorerUrl(`transaction/${transactionId}`);
}

/**
 * Create an output explorer URL.
 * @param transactionId The transaction id to create the url for.
 * @param outputIndex The output index to create the url for.
 * @returns The transaction id url.
 */
export function createExplorerOutputUrl(transactionId: string, outputIndex: number): string {
	return createExplorerUrl(`output/${transactionId}${outputIndex.toString().padStart(4, "0")}`);
}

/**
 * Create an explorer URL.
 * @param resourcePath The resource path.
 * @returns The combined explorer url base and resource path.
 */
export function createExplorerUrl(resourcePath: string): string {
	return `${explorerUrl}/${StringHelper.trimLeadingSlashes(resourcePath)}`;
}

/**
 * Alias Id to Bech32.
 * @param hrp The hrp for the bech32.
 * @param aliasId The alias id to convert.
 * @returns The bech32 address.
 */
export function aliasIdToBech32(hrp: string, aliasId: string): string {
	return idToBech32(hrp, aliasId, 8);
}

/**
 * Nft Id to Bech32.
 * @param hrp The hrp for the bech32.
 * @param nftId The nft id to convert.
 * @returns The bech32 address.
 */
export function nftIdToBech32(hrp: string, nftId: string): string {
	return idToBech32(hrp, nftId, 16);
}

/**
 * Id to Bech32.
 * @param hrp The hrp for the bech32.
 * @param id The id to convert.
 * @param idKind The type of id.
 * @returns The bech32 address.
 */
export function idToBech32(hrp: string, id: string, idKind: number): string {
	const bytes = Converter.hexToBytes(id);
	const buffer = new Uint8Array(1 + bytes.length);
	buffer[0] = idKind;
	buffer.set(bytes, 1);
	return Bech32.encode(hrp, buffer);
}

/**
 * Convert an attestation id to an nft id.
 * @param attestationId The attestation id to convert.
 * @returns The address.
 */
export function attestationIdToNftId(attestationId: string): string {
	const attestationUrn = Urn.fromValidString(attestationId);
	const nftId = Urn.fromValidString(
		Converter.bytesToUtf8(Converter.base64ToBytes(attestationUrn.namespaceSpecific(1)))
	);
	return nftId.toString();
}
