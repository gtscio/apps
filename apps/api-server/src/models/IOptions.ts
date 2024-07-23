// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IWebServerOptions } from "@gtsc/api-models";

/**
 * The options for the API server.
 */
export interface IOptions {
	/**
	 * The options for the web server.
	 */
	webServerOptions: IWebServerOptions;

	/**
	 * The root package folder.
	 */
	rootPackageFolder: string;

	/**
	 * Whether to run in debug mode.
	 */
	debug: boolean;

	/**
	 * Whether to bootstrap the application.
	 */
	bootstrap: boolean;

	/**
	 * The environment variables.
	 */
	envVars: { [id: string]: string };

	/**
	 * The system identity.
	 */
	systemIdentity: string;

	/**
	 * The system partition id.
	 */
	systemPartitionId: string;

	/**
	 * The name of the connector to use for system logging.
	 */
	systemLoggingConnectorName: string;
}
