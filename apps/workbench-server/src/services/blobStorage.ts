// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { FileBlobStorageConnector } from "@gtsc/blob-storage-connector-file";
import { IpfsBlobStorageConnector } from "@gtsc/blob-storage-connector-ipfs";
import { MemoryBlobStorageConnector } from "@gtsc/blob-storage-connector-memory";
import { BlobStorageConnectorFactory, type IBlobStorageConnector } from "@gtsc/blob-storage-models";
import { BlobStorageService } from "@gtsc/blob-storage-service";
import { GeneralError, I18n } from "@gtsc/core";
import { ServiceFactory, type IService } from "@gtsc/services";
import { systemLogInfo } from "./logging.js";
import type { IOptions } from "../models/IOptions.js";

export const BLOB_STORAGE_SERVICE_NAME = "blob-storage";

/**
 * Initialise the blob storage service.
 * @param options The options for the web server.
 * @param services The services.
 */
export function initialiseBlobStorageService(options: IOptions, services: IService[]): void {
	systemLogInfo(I18n.formatMessage("apiServer.configuring", { element: "Blob Storage Service" }));

	const service = new BlobStorageService();
	services.push(service);
	ServiceFactory.register(BLOB_STORAGE_SERVICE_NAME, () => service);
}

/**
 * Initialise the blob storage connector factory.
 * @param options The options for the web server.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseBlobStorageConnectorFactory(
	options: IOptions,
	services: IService[]
): void {
	systemLogInfo(
		I18n.formatMessage("apiServer.configuring", { element: "Blob Storage Connector Factory" })
	);

	const type = options.envVars.SERVER_BLOB_STORAGE_CONNECTOR;

	let connector: IBlobStorageConnector;
	let namespace: string;
	if (type === "ipfs") {
		connector = new IpfsBlobStorageConnector({
			config: {
				apiUrl: options.envVars.SERVER_IPFS_URL,
				bearerToken: options.envVars.SERVER_IPFS_TOKEN
			}
		});
		namespace = IpfsBlobStorageConnector.NAMESPACE;
	} else if (type === "file") {
		connector = new FileBlobStorageConnector({
			config: {
				directory: path.join(options.storageFileRoot, "blob-storage")
			}
		});
		namespace = FileBlobStorageConnector.NAMESPACE;
	} else if (type === "memory") {
		connector = new MemoryBlobStorageConnector();
		namespace = MemoryBlobStorageConnector.NAMESPACE;
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "blobStorageConnector"
		});
	}

	services.push(connector);
	BlobStorageConnectorFactory.register(namespace, () => connector);
}
