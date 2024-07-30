// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IWebServerOptions } from "@gtsc/api-models";
import { CLIUtils } from "@gtsc/cli-core";
import { Coerce, Converter, GeneralError, Is, RandomHelper } from "@gtsc/core";
import type { HttpMethod } from "@gtsc/web";
import * as dotenv from "dotenv";
import type { IOptions } from "./models/IOptions";
import type { ISystemConfig } from "./models/ISystemConfig";

export const SYSTEM_CONFIG_FILENAME = "system-config.json";

/**
 * Find the root package folder.
 * @returns The root package folder.
 */
export function findRootPackageFolder(): string {
	// Find the root package folder.
	const rootPackageFolder = path.resolve(
		path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
	);

	return rootPackageFolder;
}

/**
 * Handles the configuration of the application.
 * @param rootPackageFolder The root package folder.
 * @returns The configuration options.
 */
export async function configure(rootPackageFolder: string): Promise<IOptions> {
	// Import environment variables from .env files.
	dotenv.config({
		path: [path.join(rootPackageFolder, ".env")]
	});

	const envVars: { [id: string]: string } = {};
	for (const envVar in process.env) {
		if (envVar.startsWith("GTSC_")) {
			envVars[envVar] = process.env[envVar] ?? "";
		}
	}

	if (!Is.objectValue(envVars)) {
		throw new GeneralError("apiServer", "noEnvVars");
	}

	const storageFileRoot = envVars.GTSC_STORAGE_FILE_ROOT;
	if (!Is.stringValue(storageFileRoot)) {
		throw new GeneralError("apiServer", "storageFileRootNotSet");
	}

	let systemConfig = await readSystemConfig(storageFileRoot);

	const webServerOptions: IWebServerOptions = {
		port: Coerce.number(envVars.GTSC_PORT),
		host: Coerce.string(envVars.GTSC_HOST),
		methods: Is.stringValue(envVars.GTSC_HTTP_METHODS)
			? (envVars.GTSC_HTTP_METHODS.split(",") as HttpMethod[])
			: undefined,
		allowedHeaders: Is.stringValue(envVars.GTSC_HTTP_ALLOWED_HEADERS)
			? envVars.GTSC_HTTP_ALLOWED_HEADERS.split(",")
			: undefined,
		exposedHeaders: Is.stringValue(envVars.GTSC_) ? envVars.GTSC_.split(",") : undefined,
		corsOrigins: Is.stringValue(envVars.GTSC_CORS_ORIGINS)
			? envVars.GTSC_CORS_ORIGINS.split(",")
			: undefined
	};

	const bootstrap = Coerce.boolean(envVars.GTSC_BOOTSTRAP) ?? false;

	if (!Is.object<ISystemConfig>(systemConfig)) {
		if (bootstrap) {
			// There is no system configuration, create one with a random partition id.
			// This is the system partition id and not the one used for data.
			systemConfig = {
				systemPartitionId: Converter.bytesToHex(RandomHelper.generate(16)),
				systemIdentity: ""
			};

			await writeSystemConfig(storageFileRoot, systemConfig);
		} else {
			// We are not bootstrapping and there is no system configuration.
			// so we cannot continue.
			throw new GeneralError("apiServer", "systemConfigNotSet");
		}
	}

	return {
		webServerOptions,
		rootPackageFolder,
		debug: Coerce.boolean(envVars.GTSC_DEBUG) ?? false,
		bootstrap,
		envVars,
		storageFileRoot,
		systemConfig,
		systemLoggingConnectorName: envVars.GTSC_SYSTEM_LOGGING_CONNECTOR_NAME ?? "system"
	};
}

/**
 * Read the system configuration.
 * @param storageFileRoot The root of the storage files.
 * @returns The system configuration.
 */
export async function readSystemConfig(
	storageFileRoot: string
): Promise<ISystemConfig | undefined> {
	const systemConfigFilename = path.join(storageFileRoot, SYSTEM_CONFIG_FILENAME);

	return CLIUtils.readJsonFile<ISystemConfig>(systemConfigFilename);
}

/**
 * Write the system configuration.
 * @param storageFileRoot The root of the storage files.
 * @param systemConfig The system configuration.
 */
export async function writeSystemConfig(
	storageFileRoot: string,
	systemConfig: ISystemConfig
): Promise<void> {
	const systemConfigFilename = path.join(storageFileRoot, SYSTEM_CONFIG_FILENAME);

	await CLIUtils.writeJsonFile(systemConfigFilename, systemConfig, false);
}
