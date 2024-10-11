// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { generateRestRoutesAuthentication } from "@twin.org/api-auth-entity-storage-service";
import type { IRestRoute } from "@twin.org/api-models";
import { generateRestRoutesInformation } from "@twin.org/api-service";
import { generateRestRoutesAttestation } from "@twin.org/attestation-service";
import { generateRestRoutesAuditableItemGraph } from "@twin.org/auditable-item-graph-service";
import { generateRestRoutesAuditableItemStream } from "@twin.org/auditable-item-stream-service";
import { generateRestRoutesBlobStorage } from "@twin.org/blob-storage-service";
import { generateRestRoutesEntityStorage } from "@twin.org/entity-storage-service";
import {
	generateRestRoutesIdentity,
	generateRestRoutesIdentityProfile
} from "@twin.org/identity-service";
import { generateRestRoutesLogging } from "@twin.org/logging-service";
import { generateRestRoutesNft } from "@twin.org/nft-service";
import { generateRestRoutesTelemetry } from "@twin.org/telemetry-service";
import { ATTESTATION_SERVICE_NAME } from "./components/attestation.js";
import { AIG_SERVICE_NAME } from "./components/auditableItemGraph.js";
import { AIS_SERVICE_NAME } from "./components/auditableItemStream.js";
import { BLOB_STORAGE_SERVICE_NAME } from "./components/blobStorage.js";
import { IDENTITY_PROFILE_SERVICE_NAME, IDENTITY_SERVICE_NAME } from "./components/identity.js";
import { INFORMATION_SERVICE_NAME } from "./components/information.js";
import { LOGGING_SERVICE_NAME } from "./components/logging.js";
import { NFT_SERVICE_NAME } from "./components/nft.js";
import { AUTH_SERVICE_NAME } from "./components/processors.js";
import { TELEMETRY_SERVICE_NAME } from "./components/telemetry.js";
import { APP_USER_ATTESTATION_ENTRY_STORAGE_SERVICE } from "./components/userEntityStorage.js";

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
		...generateRestRoutesAuditableItemGraph("aig", AIG_SERVICE_NAME),
		...generateRestRoutesAuditableItemStream("ais", AIS_SERVICE_NAME),
		...generateRestRoutesEntityStorage(
			"user-attestation",
			APP_USER_ATTESTATION_ENTRY_STORAGE_SERVICE
		)
	];
}
