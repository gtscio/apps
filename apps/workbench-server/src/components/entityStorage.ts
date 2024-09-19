// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { GeneralError, I18n, Is, StringHelper } from "@twin.org/core";
import { DynamoDbEntityStorageConnector } from "@twin.org/entity-storage-connector-dynamodb";
import { FileEntityStorageConnector } from "@twin.org/entity-storage-connector-file";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { ScyllaDBTableConnector } from "@twin.org/entity-storage-connector-scylladb";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

/**
 * Initialise the entity storage connector.
 * @param context The context for the node.
 * @param type The type of the connector.
 * @param schema The schema for the entity storage.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseEntityStorageConnector(
	context: IWorkbenchContext,
	type: string,
	schema: string
): void {
	const storageName = StringHelper.kebabCase(schema);
	nodeLogInfo(
		I18n.formatMessage("workbench.configuringEntityStorage", {
			element: "Entity Storage",
			storageName,
			storageType: type
		})
	);
	let entityStorageConnector: IEntityStorageConnector;

	if (type === "memory") {
		entityStorageConnector = new MemoryEntityStorageConnector({
			entitySchema: schema
		});
	} else if (type === "file") {
		entityStorageConnector = new FileEntityStorageConnector({
			entitySchema: schema,
			config: {
				directory: path.join(context.storageFileRoot, storageName)
			}
		});
	} else if (type === "dynamodb") {
		entityStorageConnector = new DynamoDbEntityStorageConnector({
			entitySchema: schema,
			config: {
				accessKeyId: context.envVars.WORKBENCH_DYNAMODB_ACCESS_KEY_ID,
				secretAccessKey: context.envVars.WORKBENCH_DYNAMODB_SECRET_ACCESS_KEY,
				region: context.envVars.WORKBENCH_DYNAMODB_REGION,
				tableName: `${context.envVars.WORKBENCH_DYNAMODB_TABLE_PREFIX ?? ""}${storageName}`,
				endpoint: Is.stringValue(context.envVars.WORKBENCH_DYNAMODB_ENDPOINT)
					? context.envVars.WORKBENCH_DYNAMODB_ENDPOINT
					: undefined
			}
		});
	} else if (type === "scylladb") {
		entityStorageConnector = new ScyllaDBTableConnector({
			entitySchema: schema,
			config: {
				hosts: context.envVars.WORKBENCH_SCYLLADB_HOSTS.split(","),
				localDataCenter: context.envVars.WORKBENCH_SCYLLADB_LOCAL_DATA_CENTER,
				keyspace: context.envVars.WORKBENCH_SCYLLADB_KEYSPACE,
				tableName: `${context.envVars.WORKBENCH_SCYLLADB_TABLE_PREFIX ?? ""}${storageName}`
			}
		});
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "entityStorage"
		});
	}

	context.componentInstances.push({ instanceName: storageName, component: entityStorageConnector });
	EntityStorageConnectorFactory.register(storageName, () => entityStorageConnector);
}
