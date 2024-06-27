// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IWebServerOptions } from "@gtsc/api-models";
import { Coerce, Is } from "@gtsc/core";
import type { HttpMethods } from "@gtsc/web";
import * as dotenv from "dotenv";

/**
 * Handles the configuration of the application.
 * @returns The configuration options.
 */
export function configure(): {
	webServerOptions: IWebServerOptions;
	rootPackageFolder: string;
	debug: boolean;
} {
	// Find the root package folder.
	const rootPackageFolder = path.resolve(
		path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
	);

	// Import environment variables from .env and .env.dev files.
	dotenv.config({
		path: [path.join(rootPackageFolder, ".env"), path.join(rootPackageFolder, ".env.dev")]
	});

	const webServerOptions: IWebServerOptions = {
		port: Coerce.number(process.env.PORT),
		host: Coerce.string(process.env.HOST),
		methods: Is.stringValue(process.env.HTTP_METHODS)
			? (process.env.HTTP_METHODS.split(",") as HttpMethods[])
			: undefined,
		allowedHeaders: Is.stringValue(process.env.HTTP_ALLOWED_HEADERS)
			? process.env.HTTP_ALLOWED_HEADERS.split(",")
			: undefined,
		exposedHeaders: Is.stringValue(process.env.HTTP_EXPOSED_HEADERS)
			? process.env.HTTP_EXPOSED_HEADERS.split(",")
			: undefined,
		corsOrigins: Is.stringValue(process.env.CORS_ORIGINS)
			? process.env.CORS_ORIGINS.split(",")
			: undefined
	};

	return {
		webServerOptions,
		rootPackageFolder,
		debug: Coerce.boolean(process.env.DEBUG) ?? false
	};
}
