// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IFileEntityStorageConnectorConfig } from "@gtsc/entity-storage-connector-file";
import type { IEntityStorageConfig } from "./IEntityStorageConfig";

/**
 * The file entity storage configuration.
 */
export interface IEntityStorageFileConfig extends IEntityStorageConfig {
	/**
	 * The type of the entity storage connector.
	 */
	type: "file";

	/**
	 * The type of logging connector to use.
	 */
	loggingConnectorType?: string;

	/**
	 * The configuration for the connector.
	 */
	config?: IFileEntityStorageConnectorConfig;
}
