// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	type AuditableItemStream,
	type AuditableItemStreamEntry,
	AuditableItemStreamService,
	initSchema
} from "@twin.org/auditable-item-stream-service";
import { ComponentFactory, I18n } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const AIS_SERVICE_NAME = "auditable-item-stream";

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

	const service = new AuditableItemStreamService();
	context.componentInstances.push({ instanceName: AIS_SERVICE_NAME, component: service });
	ComponentFactory.register(AIS_SERVICE_NAME, () => service);
}
