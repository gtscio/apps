// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { GeneralError, I18n } from "@gtsc/core";
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
import type { IOptions } from "../models/IOptions.js";
import { systemLogInfo } from "../progress.js";

/**
 * Initialise the identity service.
 * @param options The options for the web server.
 * @param services The services.
 */
export function initialiseIdentityService(options: IOptions, services: IService[]): void {
	systemLogInfo(I18n.formatMessage("apiServer.configuring", { element: "Identity Service" }));

	initSchemaIdentity();

	initialiseEntityStorageConnector(options, services, {
		type: options.envVars.GTSC_IDENTITY_PROFILE_ENTITY_STORAGE_TYPE as EntityStorageTypes,
		schema: nameof<IdentityProfile>(),
		storageName: "identity-profile",
		config: {
			directory: path.join(options.envVars.GTSC_ENTITY_STORAGE_FILE_ROOT, "identity-profile")
		}
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
	if (type === "iota") {
		connector = new IotaIdentityConnector({
			config: {
				clientOptions: {
					nodes: [options.envVars.GTSC_IOTA_NODE_URL],
					localPow: true
				}
			}
		});
	} else if (type === "entity-storage") {
		initSchemaIdentityStorage();
		initialiseEntityStorageConnector(options, services, {
			type: options.envVars.GTSC_IDENTITY_ENTITY_STORAGE_TYPE as EntityStorageTypes,
			schema: nameof<IdentityDocument>(),
			storageName: "identity-document",
			config: {
				directory: path.join(options.envVars.GTSC_ENTITY_STORAGE_FILE_ROOT, "identity")
			}
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
