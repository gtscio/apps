// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IWebServerOptions } from "@gtsc/api-models";
import { Coerce, Is } from "@gtsc/core";
import type { HttpMethod } from "@gtsc/web";
import * as dotenv from "dotenv";
import type { IOptions } from "./models/IOptions";

/**
 * Handles the configuration of the application.
 * @returns The configuration options.
 */
export function configure(): IOptions {
	// Find the root package folder.
	const rootPackageFolder = path.resolve(
		path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
	);

	// Import environment variables from .env and .env.dev files.
	dotenv.config({
		path: [path.join(rootPackageFolder, ".env"), path.join(rootPackageFolder, ".env.dev")]
	});

	const envVars: { [id: string]: string } = {};
	for (const envVar in process.env) {
		if (envVar.startsWith("GTSC_")) {
			envVars[envVar] = process.env[envVar] ?? "";
		}
	}

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

	return {
		webServerOptions,
		rootPackageFolder,
		debug: Coerce.boolean(envVars.GTSC_DEBUG) ?? false,
		bootstrap: Coerce.boolean(envVars.GTSC_BOOTSTRAP) ?? false,
		envVars,
		systemIdentity: envVars.GTSC_SYSTEM_IDENTITY ?? "",
		systemPartitionId: envVars.GTSC_SYSTEM_PARTITION_ID ?? "system",
		systemLoggingConnectorName: envVars.GTSC_SYSTEM_LOGGING_CONNECTOR_NAME ?? "system"
	};
}
