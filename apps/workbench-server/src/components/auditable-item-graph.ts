// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	type AuditableItemGraphChangeset,
	AuditableItemGraphService,
	type AuditableItemGraphVertex,
	initSchema
} from "@twin.org/auditable-item-graph-service";
import { Coerce, ComponentFactory, I18n } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const AIG_SERVICE_NAME = "auditable-item-graph";
export const AIG_ENCRYPTION_KEY = "auditable-item-graph";
export const AIG_ASSERTION_METHOD_ID = "auditable-item-graph";

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

	const service = new AuditableItemGraphService({
		vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
		identityConnectorType: context.envVars.WORKBENCH_IDENTITY_CONNECTOR,
		immutableStorageType: context.envVars.WORKBENCH_IMMUTABLE_STORAGE_CONNECTOR,
		config: {
			vaultKeyId: AIG_ENCRYPTION_KEY,
			assertionMethodId: AIG_ASSERTION_METHOD_ID,
			enableImmutableDiffs: Coerce.boolean(context.envVars.WORKBENCH_AIG_ENABLE_DIFF_SETS)
		}
	});
	context.componentInstances.push({ instanceName: AIG_SERVICE_NAME, component: service });
	ComponentFactory.register(AIG_SERVICE_NAME, () => service);
}
