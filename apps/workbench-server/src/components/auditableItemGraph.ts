// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	type AuditableItemGraphChangeset,
	AuditableItemGraphService,
	type AuditableItemGraphVertex,
	initSchema
} from "@twin.org/auditable-item-graph-service";
import { ComponentFactory, I18n } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const AIG_SERVICE_NAME = "auditable-item-graph";

/**
 * Initialise the auditable item graph service.
 * @param context The context for the node.
 */
export function initialiseAuditableItemGraphService(context: IWorkbenchContext): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Auditable Item Graph Service" })
	);

	initSchema();
	initialiseEntityStorageConnector(
		context,
		context.envVars.WORKBENCH_AIG_VERTEX_ENTITY_STORAGE_TYPE,
		nameof<AuditableItemGraphVertex>()
	);
	initialiseEntityStorageConnector(
		context,
		context.envVars.WORKBENCH_AIG_CHANGESET_ENTITY_STORAGE_TYPE,
		nameof<AuditableItemGraphChangeset>()
	);

	const service = new AuditableItemGraphService();
	context.componentInstances.push({ instanceName: AIG_SERVICE_NAME, component: service });
	ComponentFactory.register(AIG_SERVICE_NAME, () => service);
}
