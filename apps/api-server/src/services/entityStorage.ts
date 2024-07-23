// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, I18n } from "@gtsc/core";
import {
	FileEntityStorageConnector,
	type IFileEntityStorageConnectorConfig
} from "@gtsc/entity-storage-connector-file";
import { MemoryEntityStorageConnector } from "@gtsc/entity-storage-connector-memory";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@gtsc/entity-storage-models";
import type { IService } from "@gtsc/services";
import type { EntityStorageConfigTypes } from "../models/entityStorage/entityStorageConfigTypes.js";
import type { IOptions } from "../models/IOptions.js";
import { systemLogInfo } from "../progress.js";

/**
 * Initialise the entity storage connector.
 * @param options The options for the web server.
 * @param services The services.
 * @param entityStorageConfig The entity storage connector config.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseEntityStorageConnector(
	options: IOptions,
	services: IService[],
	entityStorageConfig: EntityStorageConfigTypes
): void {
	systemLogInfo(
		I18n.formatMessage("apiServer.configuringEntityStorage", {
			element: "Entity Storage",
			storageName: entityStorageConfig.storageName,
			storageType: entityStorageConfig.type
		})
	);
	let entityStorageConnector: IEntityStorageConnector;

	const type = entityStorageConfig.type;
	if (type === "memory") {
		entityStorageConnector = new MemoryEntityStorageConnector({
			entitySchema: entityStorageConfig.schema
		});
	} else if (type === "file") {
		entityStorageConnector = new FileEntityStorageConnector({
			entitySchema: entityStorageConfig.schema,
			config: entityStorageConfig.config as IFileEntityStorageConnectorConfig
		});
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "entityStorage"
		});
	}

	services.push(entityStorageConnector);
	EntityStorageConnectorFactory.register(
		entityStorageConfig.storageName,
		() => entityStorageConnector
	);
}
