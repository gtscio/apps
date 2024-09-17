// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	type AuditableItemStream,
	type AuditableItemStreamEntry,
	AuditableItemStreamService,
	initSchema
} from "@gtsc/auditable-item-stream-service";
import { ComponentFactory, I18n } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const AIS_SERVICE_NAME = "auditable-item-stream";
export const AIS_ENCRYPTION_KEY = "auditable-item-stream";
export const AIS_ASSERTION_METHOD_ID = "auditable-item-stream";

/**
 * Initialise the auditable item stream service.
 * @param context The context for the node.
 */
export function initialiseAuditableItemStreamService(context: IWorkbenchContext): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Auditable Item Stream Service" })
	);

	initSchema();
	initialiseEntityStorageConnector(
		context,
		context.envVars.WORKBENCH_AIS_STREAM_ENTITY_STORAGE_TYPE,
		nameof<AuditableItemStream>()
	);
	initialiseEntityStorageConnector(
		context,
		context.envVars.WORKBENCH_AIS_ENTRY_ENTITY_STORAGE_TYPE,
		nameof<AuditableItemStreamEntry>()
	);

	const service = new AuditableItemStreamService({
		vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
		identityConnectorType: context.envVars.WORKBENCH_IDENTITY_CONNECTOR,
		immutableStorageType: context.envVars.WORKBENCH_IMMUTABLE_STORAGE_CONNECTOR,
		config: {
			vaultKeyId: AIS_ENCRYPTION_KEY,
			assertionMethodId: AIS_ASSERTION_METHOD_ID
		}
	});
	context.componentInstances.push({ instanceName: AIS_SERVICE_NAME, component: service });
	ComponentFactory.register(AIS_SERVICE_NAME, () => service);
}
