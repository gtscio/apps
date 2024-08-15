// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { FileBlobStorageConnector } from "@gtsc/blob-storage-connector-file";
import { IpfsBlobStorageConnector } from "@gtsc/blob-storage-connector-ipfs";
import { MemoryBlobStorageConnector } from "@gtsc/blob-storage-connector-memory";
import { BlobStorageConnectorFactory, type IBlobStorageConnector } from "@gtsc/blob-storage-models";
import {
	type BlobMetadata,
	BlobStorageService,
	initSchema as initSchemaBlobStorage
} from "@gtsc/blob-storage-service";
import { ComponentFactory, GeneralError, I18n } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const BLOB_STORAGE_SERVICE_NAME = "blob-storage";

/**
 * Initialise the blob storage service.
 * @param context The context for the node.
 */
export function initialiseBlobStorageService(context: IWorkbenchContext): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Blob Storage Service" }));

	initSchemaBlobStorage();
	initialiseEntityStorageConnector(
		context,
		context.envVars.WORKBENCH_BLOB_STORAGE_METADATA_ENTITY_STORAGE_TYPE,
		nameof<BlobMetadata>()
	);

	const service = new BlobStorageService();
	context.componentInstances.push({ instanceName: BLOB_STORAGE_SERVICE_NAME, component: service });
	ComponentFactory.register(BLOB_STORAGE_SERVICE_NAME, () => service);
}

/**
 * Initialise the blob storage connector factory.
 * @param context The context for the node.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseBlobStorageConnectorFactory(context: IWorkbenchContext): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Blob Storage Connector Factory" })
	);

	const type = context.envVars.WORKBENCH_BLOB_STORAGE_CONNECTOR;

	let connector: IBlobStorageConnector;
	let namespace: string;
	if (type === "ipfs") {
		connector = new IpfsBlobStorageConnector({
			config: {
				apiUrl: context.envVars.WORKBENCH_IPFS_URL,
				bearerToken: context.envVars.WORKBENCH_IPFS_TOKEN
			}
		});
		namespace = IpfsBlobStorageConnector.NAMESPACE;
	} else if (type === "file") {
		connector = new FileBlobStorageConnector({
			config: {
				directory: path.join(context.storageFileRoot, "blob-storage")
			}
		});
		namespace = FileBlobStorageConnector.NAMESPACE;
	} else if (type === "memory") {
		connector = new MemoryBlobStorageConnector();
		namespace = MemoryBlobStorageConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "blobStorageConnector"
		});
	}

	context.componentInstances.push({ instanceName: namespace, component: connector });
	BlobStorageConnectorFactory.register(namespace, () => connector);
}
