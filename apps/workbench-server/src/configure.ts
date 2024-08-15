// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IWebServerOptions } from "@gtsc/api-models";
import { CLIUtils } from "@gtsc/cli-core";
import { Coerce, GeneralError, Is } from "@gtsc/core";
import type { HttpMethod } from "@gtsc/web";
import * as dotenv from "dotenv";
import type { IWorkbenchConfig } from "./models/IWorkbenchConfig";
import type { IWorkbenchContext } from "./models/IWorkbenchContext";

export const DEFAULT_CONFIG_FILENAME = "workbench-config.json";
export const DEFAULT_NODE_LOGGING_CONNECTOR = "node-logging";

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
 * @returns The context.
 */
export async function configure(rootPackageFolder: string): Promise<IWorkbenchContext> {
	// Import environment variables from .env files.
	dotenv.config({
		path: [path.join(rootPackageFolder, ".env")]
	});

	const envVars: { [id: string]: string } = {};
	for (const envVar in process.env) {
		if (envVar.startsWith("WORKBENCH_")) {
			envVars[envVar] = process.env[envVar] ?? "";
		}
	}

	if (!Is.objectValue(envVars)) {
		throw new GeneralError("Workbench", "noEnvVars");
	}

	const storageFileRoot = envVars.WORKBENCH_STORAGE_FILE_ROOT;
	if (!Is.stringValue(storageFileRoot)) {
		throw new GeneralError("Workbench", "storageFileRootNotSet");
	}

	const webServerOptions: IWebServerOptions = {
		port: Coerce.number(envVars.WORKBENCH_PORT),
		host: Coerce.string(envVars.WORKBENCH_HOST),
		methods: Is.stringValue(envVars.WORKBENCH_HTTP_METHODS)
			? (envVars.WORKBENCH_HTTP_METHODS.split(",") as HttpMethod[])
			: undefined,
		allowedHeaders: Is.stringValue(envVars.WORKBENCH_HTTP_ALLOWED_HEADERS)
			? envVars.WORKBENCH_HTTP_ALLOWED_HEADERS.split(",")
			: undefined,
		exposedHeaders: Is.stringValue(envVars.WORKBENCH_HTTP_EXPOSED_HEADERS)
			? envVars.WORKBENCH_HTTP_EXPOSED_HEADERS.split(",")
			: undefined,
		corsOrigins: Is.stringValue(envVars.WORKBENCH_CORS_ORIGINS)
			? envVars.WORKBENCH_CORS_ORIGINS.split(",")
			: undefined
	};

	const workbenchConfigFilename = envVars.WORKBENCH_CONFIG_FILENAME ?? DEFAULT_CONFIG_FILENAME;
	const workbenchConfig: IWorkbenchConfig = (await readConfig(
		storageFileRoot,
		workbenchConfigFilename
	)) ?? { bootstrappedComponents: [] };
	workbenchConfig.bootstrappedComponents ??= [];

	return {
		webServerOptions,
		rootPackageFolder,
		debug: Coerce.boolean(envVars.WORKBENCH_DEBUG) ?? false,
		envVars,
		storageFileRoot,
		workbenchConfigFilename,
		config: workbenchConfig,
		configUpdated: false,
		nodeLoggingConnectorName:
			envVars.WORKBENCH_NODE_LOGGING_CONNECTOR_NAME ?? DEFAULT_NODE_LOGGING_CONNECTOR,
		componentInstances: []
	};
}

/**
 * Read the configuration.
 * @param storageFileRoot The root of the storage files.
 * @param configFilename The workbench config filename.
 * @returns The configuration.
 */
export async function readConfig(
	storageFileRoot: string,
	configFilename: string
): Promise<IWorkbenchConfig | undefined> {
	const fullConfigFilename = path.join(storageFileRoot, configFilename);

	return CLIUtils.readJsonFile<IWorkbenchConfig>(fullConfigFilename);
}

/**
 * Write the configuration.
 * @param storageFileRoot The root of the storage files.
 * @param configFilename The config filename.
 * @param config The configuration.
 */
export async function writeConfig(
	storageFileRoot: string,
	configFilename: string,
	config: IWorkbenchConfig
): Promise<void> {
	const fullConfigFilename = path.join(storageFileRoot, configFilename);

	await CLIUtils.writeJsonFile(fullConfigFilename, config, false);
}
