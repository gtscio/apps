// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { generateRestRoutesAuthentication } from "@gtsc/api-auth-entity-storage-service";
import type { IRestRoute } from "@gtsc/api-models";
import { generateRestRoutesInformation } from "@gtsc/api-service";
import { generateRestRoutesAttestation } from "@gtsc/attestation-service";
import { generateRestRoutesAuditableItemGraph } from "@gtsc/auditable-item-graph-service";
import { generateRestRoutesBlobStorage } from "@gtsc/blob-storage-service";
import {
	generateRestRoutesIdentity,
	generateRestRoutesIdentityProfile
} from "@gtsc/identity-service";
import { generateRestRoutesLogging } from "@gtsc/logging-service";
import { generateRestRoutesNft } from "@gtsc/nft-service";
import { generateRestRoutesTelemetry } from "@gtsc/telemetry-service";
import { ATTESTATION_SERVICE_NAME } from "./components/attestation.js";
import { AIG_SERVICE_NAME } from "./components/auditable-item-graph.js";
import { BLOB_STORAGE_SERVICE_NAME } from "./components/blobStorage.js";
import { IDENTITY_PROFILE_SERVICE_NAME, IDENTITY_SERVICE_NAME } from "./components/identity.js";
import { INFORMATION_SERVICE_NAME } from "./components/information.js";
import { LOGGING_SERVICE_NAME } from "./components/logging.js";
import { NFT_SERVICE_NAME } from "./components/nft.js";
import { AUTH_SERVICE_NAME } from "./components/processors.js";
import { TELEMETRY_SERVICE_NAME } from "./components/telemetry.js";

/**
 * The routes for the application.
 * @returns The routes for the application.
 */
export function buildRoutes(): IRestRoute[] {
	return [
		...generateRestRoutesInformation("", INFORMATION_SERVICE_NAME),
		...generateRestRoutesAuthentication("authentication", AUTH_SERVICE_NAME),
		...generateRestRoutesBlobStorage("blob", BLOB_STORAGE_SERVICE_NAME),
		...generateRestRoutesLogging("logging", LOGGING_SERVICE_NAME),
		...generateRestRoutesTelemetry("telemetry", TELEMETRY_SERVICE_NAME),
		...generateRestRoutesIdentity("identity", IDENTITY_SERVICE_NAME),
		...generateRestRoutesIdentityProfile("identity/profile", IDENTITY_PROFILE_SERVICE_NAME),
		...generateRestRoutesNft("nft", NFT_SERVICE_NAME),
		...generateRestRoutesAttestation("attestation", ATTESTATION_SERVICE_NAME),
		...generateRestRoutesAuditableItemGraph("aig", AIG_SERVICE_NAME)
	];
}
