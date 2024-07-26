// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { generateRestRoutesAuthentication } from "@gtsc/api-auth-entity-storage-service";
import type { IRestRoute } from "@gtsc/api-models";
import { generateRestRoutesInformation } from "@gtsc/api-service";
import { generateRestRoutesAttestation } from "@gtsc/attestation-service";
import { generateRestRoutesBlobStorage } from "@gtsc/blob-storage-service";
import {
	generateRestRoutesIdentity,
	generateRestRoutesIdentityProfile
} from "@gtsc/identity-service";
import { generateRestRoutesNft } from "@gtsc/nft-service";
import { ATTESTATION_SERVICE_NAME } from "./services/attestation.js";
import { BLOB_STORAGE_SERVICE_NAME } from "./services/blobStorage.js";
import { IDENTITY_PROFILE_SERVICE_NAME, IDENTITY_SERVICE_NAME } from "./services/identity.js";
import { INFORMATION_SERVICE_NAME } from "./services/information.js";
import { NFT_SERVICE_NAME } from "./services/nft.js";
import { AUTH_SERVICE_NAME } from "./services/processors.js";

/**
 * The routes for the application.
 * @returns The routes for the application.
 */
export function buildRoutes(): IRestRoute[] {
	return [
		...generateRestRoutesInformation("", INFORMATION_SERVICE_NAME),
		...generateRestRoutesAuthentication("authentication", AUTH_SERVICE_NAME),
		...generateRestRoutesIdentity("identity", IDENTITY_SERVICE_NAME),
		...generateRestRoutesIdentityProfile("identity/profile", IDENTITY_PROFILE_SERVICE_NAME),
		...generateRestRoutesBlobStorage("blob-storage", BLOB_STORAGE_SERVICE_NAME),
		...generateRestRoutesNft("nft", NFT_SERVICE_NAME),
		...generateRestRoutesAttestation("attestation", ATTESTATION_SERVICE_NAME)
	];
}
