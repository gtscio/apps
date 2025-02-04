// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { StringHelper, type ILocale } from "@twin.org/core";
import { initLocales } from "@twin.org/ui-components-svelte";
import { init as initAttestation } from "./attestation";
import { init as initAttestations } from "./attestations";
import { init as initAuditableItemStreams } from "./auditableItemStreams";
import { init as initAuthentication } from "./authentication";
import { init as initBlobStorage } from "./blobStorage";
import { init as initEventBus } from "./eventBus";
import { init as initIdentity } from "./identity";
import { init as initIdentityProfile } from "./identityProfile";
import { init as initIdentityResolver } from "./identityResolver";
import { init as initImmutableProof } from "./immutableProof";
import { init as initInformation } from "./information";
import { init as initIota } from "./iota";
import { init as initNft } from "./nft";
import { init as initNfts } from "./nfts";

export let publicBaseUrl = "";
export let privateBaseUrl = "";

/**
 * Initialise the app.
 * @param options The options for the application.
 * @param options.rootUrl The root URL.
 * @param options.localesIndex The locales index.
 * @param options.apiUrl The API url.
 * @param options.envPublicBaseUrl The base url to use for generating publicly accessible links.
 * @param options.envPrivateBaseUrl The base url to use for generating privately accessible links.
 * @param options.debugLanguages Should the languages show the debug entries.
 * @param options.iotaExplorerUrl The url for IOTA explorer.
 */
export async function init(options: {
	rootUrl: URL;
	localesIndex: ILocale[];
	apiUrl: string;
	envPublicBaseUrl: string;
	envPrivateBaseUrl: string;
	iotaExplorerUrl: string;
	debugLanguages: boolean;
}): Promise<void> {
	publicBaseUrl = StringHelper.trimTrailingSlashes(options.envPublicBaseUrl);
	privateBaseUrl = StringHelper.trimTrailingSlashes(options.envPrivateBaseUrl);

	await initLocales(options.rootUrl, options.localesIndex, options.debugLanguages);
	await initInformation(options.apiUrl);
	await initAuthentication(options.apiUrl);
	await initIdentityProfile(options.apiUrl);
	await initIdentityResolver(options.apiUrl);
	await initIdentity(options.apiUrl);
	await initBlobStorage(options.apiUrl);
	await initAttestation(options.apiUrl);
	await initIota(options.iotaExplorerUrl);
	await initAttestations(options.apiUrl);
	await initAuditableItemStreams(options.apiUrl);
	await initImmutableProof(options.apiUrl);
	await initEventBus(options.apiUrl);
	await initNft(options.apiUrl);
	await initNfts(options.apiUrl);
}

/**
 * Create a public URL.
 * @param resourcePath The resource path.
 * @returns The combined public url base and resource path.
 */
export function createPublicUrl(resourcePath: string): string {
	return `${publicBaseUrl}/${StringHelper.trimLeadingSlashes(resourcePath)}`;
}

/**
 * Create a private URL.
 * @param resourcePath The resource path.
 * @returns The combined private url base and resource path.
 */
export function createPrivateUrl(resourcePath: string): string {
	return `${privateBaseUrl}/${StringHelper.trimLeadingSlashes(resourcePath)}`;
}
