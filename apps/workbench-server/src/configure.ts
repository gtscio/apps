// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import type { IWebServerOptions } from "@twin.org/api-models";
import { Coerce, GeneralError, Is } from "@twin.org/core";
import type { IEngineCoreConfig, IEngineServerConfig } from "@twin.org/engine-models";
import type { HttpMethod } from "@twin.org/web";
import * as dotenv from "dotenv";
import type { IWorkbenchEnvironmentVariables } from "./models/IWorkbenchEnvironmentVariables";

/**
 * Handles the configuration of the application.
 * @param rootPackageFolder The root package folder.
 * @returns The the config for the core and the server.
 */
export async function configure(rootPackageFolder: string): Promise<{
	coreConfig: IEngineCoreConfig;
	serverConfig: IEngineServerConfig;
	envVars: IWorkbenchEnvironmentVariables;
	stateFilename: string;
}> {
	// Import environment variables from .env files.
	dotenv.config({
		path: [path.join(rootPackageFolder, ".env")]
	});

	const debug = Coerce.boolean(process.env.WORKBENCH_DEBUG) ?? false;

	const envVars: IWorkbenchEnvironmentVariables = {
		adminUsername: Coerce.string(process.env.WORKBENCH_ADMIN_USERNAME) ?? "admin@node",
		enableBlobEncryption:
			Coerce.boolean(process.env.WORKBENCH_BLOB_STORAGE_ENABLE_ENCRYPTION) ?? false,
		blobEncryptionKey:
			Coerce.string(process.env.WORKBENCH_BLOB_ENCRYPTION_KEY) ?? "blob-encryption",
		authSigningKey: Coerce.string(process.env.WORKBENCH_AUTH_SIGNING_KEY) ?? "auth-signing",
		attestationAssertionMethodId:
			Coerce.string(process.env.WORKBENCH_ATTESTATION_ASSERTION_METHOD_ID) ??
			"attestation-assertion",
		immutableProofHashKey:
			Coerce.string(process.env.WORKBENCH_IMMUTABLE_PROOF_HASH_KEY) ?? "immutable-proof-hash",
		immutableProofAssertionMethodId:
			Coerce.string(process.env.WORKBENCH_IMMUTABLE_PROOF_ASSERTION_METHOD_ID) ??
			"immutable-proof-assertion",
		iotaExploreUrl: Coerce.string(process.env.WORKBENCH_IOTA_EXPLORER_URL) ?? ""
	};

	const storageFileRoot = process.env.WORKBENCH_STORAGE_FILE_ROOT;
	if (!Is.stringValue(storageFileRoot)) {
		throw new GeneralError("Workbench", "storageFileRootNotSet");
	}

	const stateFilename = Is.stringValue(process.env.WORKBENCH_STATE_FILENAME)
		? process.env.WORKBENCH_STATE_FILENAME
		: "workbench-state.json";

	const webServerOptions: IWebServerOptions = {
		port: Coerce.number(process.env.WORKBENCH_PORT),
		host: Coerce.string(process.env.WORKBENCH_HOST),
		methods: Is.stringValue(process.env.WORKBENCH_HTTP_METHODS)
			? (process.env.WORKBENCH_HTTP_METHODS.split(",") as HttpMethod[])
			: undefined,
		allowedHeaders: Is.stringValue(process.env.WORKBENCH_HTTP_ALLOWED_HEADERS)
			? process.env.WORKBENCH_HTTP_ALLOWED_HEADERS.split(",")
			: undefined,
		exposedHeaders: Is.stringValue(process.env.WORKBENCH_HTTP_EXPOSED_HEADERS)
			? process.env.WORKBENCH_HTTP_EXPOSED_HEADERS.split(",")
			: undefined,
		corsOrigins: Is.stringValue(process.env.WORKBENCH_CORS_ORIGINS)
			? process.env.WORKBENCH_CORS_ORIGINS.split(",")
			: undefined
	};

	const defaultStorageType = process.env.WORKBENCH_DEFAULT_STORAGE_TYPE;
	const authProcessorType = process.env.WORKBENCH_AUTH_PROCESSOR_TYPE;

	const coreConfig: IEngineCoreConfig = {
		debug
	};

	const serverConfig: IEngineServerConfig = {
		web: webServerOptions
	};

	return {
		coreConfig,
		serverConfig,
		envVars,
		stateFilename: path.join(storageFileRoot, stateFilename)
	};
}
