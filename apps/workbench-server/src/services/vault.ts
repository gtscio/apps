// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, I18n } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IService } from "@gtsc/services";
import {
	EntityStorageVaultConnector,
	initSchema,
	type VaultKey,
	type VaultSecret
} from "@gtsc/vault-connector-entity-storage";
import { VaultConnectorFactory, type IVaultConnector } from "@gtsc/vault-models";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { systemLogInfo } from "./logging.js";
import type { IOptions } from "../models/IOptions.js";

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

	const type = options.envVars.SERVER_VAULT_CONNECTOR;

	let connector: IVaultConnector;
	let namespace: string;

	if (type === "entity-storage") {
		initSchema();
		initialiseEntityStorageConnector(
			options,
			services,
			options.envVars.SERVER_VAULT_KEY_ENTITY_STORAGE_TYPE,
			nameof<VaultKey>()
		);
		initialiseEntityStorageConnector(
			options,
			services,
			options.envVars.SERVER_VAULT_SECRET_ENTITY_STORAGE_TYPE,
			nameof<VaultSecret>()
		);
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
