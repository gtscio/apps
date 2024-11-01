// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, I18n } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import {
	EntityStorageVaultConnector,
	initSchema,
	type VaultKey,
	type VaultSecret
} from "@twin.org/vault-connector-entity-storage";
import { HashicorpVaultConnector } from "@twin.org/vault-connector-hashicorp";
import { VaultConnectorFactory, type IVaultConnector } from "@twin.org/vault-models";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

/**
 * Initialise the vault connector factory.
 * @param context The context for the node.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseVaultConnectorFactory(context: IWorkbenchContext): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Vault Connector Factory" }));

	const type = context.envVars.WORKBENCH_VAULT_CONNECTOR;

	let connector: IVaultConnector;
	let namespace: string;

	if (type === "entity-storage") {
		initSchema();
		initialiseEntityStorageConnector(
			context,
			context.envVars.WORKBENCH_VAULT_KEY_ENTITY_STORAGE_TYPE,
			nameof<VaultKey>()
		);
		initialiseEntityStorageConnector(
			context,
			context.envVars.WORKBENCH_VAULT_SECRET_ENTITY_STORAGE_TYPE,
			nameof<VaultSecret>()
		);
		connector = new EntityStorageVaultConnector();
		namespace = EntityStorageVaultConnector.NAMESPACE;
	} else if (type === "hashicorp") {
		connector = new HashicorpVaultConnector({
			config: {
				endpoint: context.envVars.WORKBENCH_HASHICORP_VAULT_URL,
				token: context.envVars.WORKBENCH_HASHICORP_VAULT_TOKEN
			}
		});
		namespace = HashicorpVaultConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "vaultConnector"
		});
	}

	context.componentInstances.push({ instanceName: namespace, component: connector });
	VaultConnectorFactory.register(namespace, () => connector);
}
