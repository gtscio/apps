// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, I18n, type IComponent } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import {
	EntityStorageVaultConnector,
	initSchema,
	type VaultKey,
	type VaultSecret
} from "@gtsc/vault-connector-entity-storage";
import { VaultConnectorFactory, type IVaultConnector } from "@gtsc/vault-models";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

/**
 * Initialise the vault connector factory.
 * @param context The context for the node.
 * @param components The components.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseVaultConnectorFactory(
	context: IWorkbenchContext,
	components: IComponent[]
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Vault Connector Factory" }));

	const type = context.envVars.WORKBENCH_VAULT_CONNECTOR;

	let connector: IVaultConnector;
	let namespace: string;

	if (type === "entity-storage") {
		initSchema();
		initialiseEntityStorageConnector(
			context,
			components,
			context.envVars.WORKBENCH_VAULT_KEY_ENTITY_STORAGE_TYPE,
			nameof<VaultKey>()
		);
		initialiseEntityStorageConnector(
			context,
			components,
			context.envVars.WORKBENCH_VAULT_SECRET_ENTITY_STORAGE_TYPE,
			nameof<VaultSecret>()
		);
		connector = new EntityStorageVaultConnector();
		namespace = EntityStorageVaultConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "vaultConnector"
		});
	}

	components.push(connector);
	VaultConnectorFactory.register(namespace, () => connector);
}
