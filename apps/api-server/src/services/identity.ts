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
import type { EntityStorageTypes } from "../models/entityStorage/entityStorageTypes.js";
import { logInfo } from "../progress.js";

/**
 * Initialise the identity service.
 * @param envVars The environment variables.
 * @param services The services.
 */
export function initialiseIdentityService(
	envVars: { [id: string]: string },
	services: IService[]
): void {
	logInfo(I18n.formatMessage("apiServer.configuring", { element: "Identity Service" }));

	initSchemaIdentity();

	initialiseEntityStorageConnector(envVars, services, {
		type: envVars.GTSC_IDENTITY_PROFILE_ENTITY_STORAGE_TYPE as EntityStorageTypes,
		schema: nameof<IdentityProfile>(),
		storageName: "identity-profile",
		config: Coerce.object(envVars.GTSC_IDENTITY_PROFILE_ENTITY_STORAGE_OPTIONS)
	});

	const service = new IdentityService();
	services.push(service);
	ServiceFactory.register("identity", () => service);

	const serviceProfile = new IdentityProfileService();
	services.push(serviceProfile);
	ServiceFactory.register("identity-profile", () => serviceProfile);
}

/**
 * Initialise the identity connector factory.
 * @param envVars The environment variables.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseIdentityConnectorFactory(
	envVars: { [id: string]: string },
	services: IService[]
): void {
	logInfo(I18n.formatMessage("apiServer.configuring", { element: "Identity Connector Factory" }));

	const type = envVars.GTSC_IDENTITY_CONNECTOR;

	let connector: IIdentityConnector;
	if (type === "iota") {
		connector = new IotaIdentityConnector({
			config: {
				clientOptions: {
					nodes: [envVars.GTSC_IOTA_NODE_URL],
					localPow: true
				}
			}
		});
	} else if (type === "entity-storage") {
		initSchemaIdentityStorage();
		initialiseEntityStorageConnector(envVars, services, {
			type: envVars.GTSC_IDENTITY_CONNECTOR_ENTITY_STORAGE_TYPE as EntityStorageTypes,
			schema: nameof<IdentityDocument>(),
			storageName: "identity-document",
			config: Coerce.object(envVars.GTSC_IDENTITY_CONNECTOR_ENTITY_STORAGE_OPTIONS)
		});
		connector = new EntityStorageIdentityConnector();
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "identityConnector"
		});
	}

	services.push(connector);
	IdentityConnectorFactory.register("identity", () => connector);
}
