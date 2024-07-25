// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { GeneralError, I18n } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IService } from "@gtsc/services";
import {
	EntityStorageVaultConnector,
	type VaultKey,
	type VaultSecret,
	initSchema
} from "@gtsc/vault-connector-entity-storage";
import { type IVaultConnector, VaultConnectorFactory } from "@gtsc/vault-models";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import type { EntityStorageTypes } from "../models/entityStorage/entityStorageTypes.js";
import type { IOptions } from "../models/IOptions.js";
import { systemLogInfo } from "../progress.js";

/**
 * Initialise the vault connector factory.
 * @param options The options for the web server.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseVaultConnectorFactory(options: IOptions, services: IService[]): void {
	systemLogInfo(
		I18n.formatMessage("apiServer.configuring", { element: "Vault Connector Factory" })
	);

	const type = options.envVars.GTSC_VAULT_CONNECTOR;

	let connector: IVaultConnector;
	let namespace: string;

	if (type === "entity-storage") {
		initSchema();
		initialiseEntityStorageConnector(options, services, {
			type: options.envVars.GTSC_VAULT_KEY_ENTITY_STORAGE_TYPE as EntityStorageTypes,
			schema: nameof<VaultKey>(),
			storageName: "vault-key",
			config: {
				directory: path.join(options.envVars.GTSC_ENTITY_STORAGE_FILE_ROOT, "vault-key")
			}
		});
		initialiseEntityStorageConnector(options, services, {
			type: options.envVars.GTSC_VAULT_SECRET_ENTITY_STORAGE_TYPE as EntityStorageTypes,
			schema: nameof<VaultSecret>(),
			storageName: "vault-secret",
			config: {
				directory: path.join(options.envVars.GTSC_ENTITY_STORAGE_FILE_ROOT, "vault-secret")
			}
		});
		connector = new EntityStorageVaultConnector();
		namespace = EntityStorageVaultConnector.NAMESPACE;
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "vaultConnector"
		});
	}

	services.push(connector);
	VaultConnectorFactory.register(namespace, () => connector);
}
