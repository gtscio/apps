// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IWebServerOptions } from "@gtsc/api-models";
import type { IWorkbenchConfig } from "./IWorkbenchConfig";

/**
 * The context for the node.
 */
export interface IWorkbenchContext {
	/**
	 * The context for the node.
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
	 * The root storage folder.
	 */
	storageFileRoot: string;

	/**
	 * The name of the connector to use for node logging.
	 */
	nodeLoggingConnectorName: string;

	/**
	 * The name of the workbench config file.
	 */
	workbenchConfigFilename: string;

	/**
	 * The workbench config.
	 */
	config: IWorkbenchConfig;
}
