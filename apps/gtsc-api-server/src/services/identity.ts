// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, GeneralError, I18n } from "@gtsc/core";
import {
	EntityStorageIdentityConnector,
	type IdentityDocument,
	initSchema as initSchemaIdentityStorage
} from "@gtsc/identity-connector-entity-storage";
import { IotaIdentityConnector } from "@gtsc/identity-connector-iota";
import { IdentityConnectorFactory, type IIdentityConnector } from "@gtsc/identity-models";
import {
	type IdentityProfile,
	IdentityProfileService,
	IdentityService,
	initSchema as initSchemaIdentity
} from "@gtsc/identity-service";
import { nameof } from "@gtsc/nameof";
import { type IService, ServiceFactory } from "@gtsc/services";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { systemLogInfo } from "./logging.js";
import type { IOptions } from "../models/IOptions.js";

export const IDENTITY_SERVICE_NAME = "identity";
export const IDENTITY_PROFILE_SERVICE_NAME = "identity-profile";

/**
 * Initialise the identity service.
 * @param options The options for the web server.
 * @param services The services.
 */
export function initialiseIdentityService(options: IOptions, services: IService[]): void {
	systemLogInfo(I18n.formatMessage("apiServer.configuring", { element: "Identity Service" }));

	initSchemaIdentity();

	initialiseEntityStorageConnector(
		options,
		services,
		options.envVars.GTSC_IDENTITY_PROFILE_ENTITY_STORAGE_TYPE,
		nameof<IdentityProfile>()
	);

	const service = new IdentityService();
	services.push(service);
	ServiceFactory.register(IDENTITY_SERVICE_NAME, () => service);

	const serviceProfile = new IdentityProfileService();
	services.push(serviceProfile);
	ServiceFactory.register(IDENTITY_PROFILE_SERVICE_NAME, () => serviceProfile);
}

/**
 * Initialise the identity connector factory.
 * @param options The options for the web server.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseIdentityConnectorFactory(options: IOptions, services: IService[]): void {
	systemLogInfo(
		I18n.formatMessage("apiServer.configuring", { element: "Identity Connector Factory" })
	);

	const type = options.envVars.GTSC_IDENTITY_CONNECTOR;

	let connector: IIdentityConnector;
	let namespace: string;
	if (type === "iota") {
		connector = new IotaIdentityConnector({
			vaultConnectorType: options.envVars.GTSC_VAULT_CONNECTOR,
			config: {
				clientOptions: {
					nodes: [options.envVars.GTSC_IOTA_NODE_URL],
					localPow: true
				},
				coinType: Coerce.number(options.envVars.GTSC_IOTA_COIN_TYPE)
			}
		});
		namespace = IotaIdentityConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		initSchemaIdentityStorage();
		initialiseEntityStorageConnector(
			options,
			services,
			options.envVars.GTSC_IDENTITY_ENTITY_STORAGE_TYPE,
			nameof<IdentityDocument>()
		);
		connector = new EntityStorageIdentityConnector({
			vaultConnectorType: options.envVars.GTSC_VAULT_CONNECTOR
		});
		namespace = EntityStorageIdentityConnector.NAMESPACE;
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "identityConnector"
		});
	}

	services.push(connector);
	IdentityConnectorFactory.register(namespace, () => connector);
}
