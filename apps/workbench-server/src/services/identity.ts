// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, GeneralError, I18n } from "@gtsc/core";
import {
	EntityStorageIdentityConnector,
	EntityStorageIdentityProfileConnector,
	initSchema as initSchemaIdentityStorage,
	type IdentityDocument,
	type IdentityProfile
} from "@gtsc/identity-connector-entity-storage";
import { IotaIdentityConnector } from "@gtsc/identity-connector-iota";
import {
	IdentityConnectorFactory,
	IdentityProfileConnectorFactory,
	type IIdentityConnector,
	type IIdentityProfileConnector
} from "@gtsc/identity-models";
import { IdentityProfileService, IdentityService } from "@gtsc/identity-service";
import { nameof } from "@gtsc/nameof";
import { ServiceFactory, type IService } from "@gtsc/services";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const IDENTITY_SERVICE_NAME = "identity";
export const IDENTITY_PROFILE_SERVICE_NAME = "identity-profile";

/**
 * Initialise the identity service.
 * @param context The context for the node.
 * @param services The services.
 */
export function initialiseIdentityService(context: IWorkbenchContext, services: IService[]): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Identity Service" }));

	const service = new IdentityService();
	services.push(service);
	ServiceFactory.register(IDENTITY_SERVICE_NAME, () => service);
}

/**
 * Initialise the identity connector factory.
 * @param context The context for the node.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseIdentityConnectorFactory(
	context: IWorkbenchContext,
	services: IService[]
): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Identity Connector Factory" })
	);

	const type = context.envVars.WORKBENCH_IDENTITY_CONNECTOR;

	let connector: IIdentityConnector;
	let namespace: string;
	if (type === "iota") {
		connector = new IotaIdentityConnector({
			vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
			walletConnectorType: context.envVars.WORKBENCH_WALLET_CONNECTOR,
			config: {
				clientOptions: {
					nodes: [context.envVars.WORKBENCH_IOTA_NODE_URL],
					localPow: true
				},
				coinType: Coerce.number(context.envVars.WORKBENCH_IOTA_COIN_TYPE)
			}
		});
		namespace = IotaIdentityConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		initSchemaIdentityStorage({ includeProfile: false });
		initialiseEntityStorageConnector(
			context,
			services,
			context.envVars.WORKBENCH_IDENTITY_ENTITY_STORAGE_TYPE,
			nameof<IdentityDocument>()
		);
		connector = new EntityStorageIdentityConnector({
			vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR
		});
		namespace = EntityStorageIdentityConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "identityConnector"
		});
	}

	services.push(connector);
	IdentityConnectorFactory.register(namespace, () => connector);
}

/**
 * Initialise the identity profile service.
 * @param context The context for the node.
 * @param services The services.
 */
export function initialiseIdentityProfileService(
	context: IWorkbenchContext,
	services: IService[]
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Identity Profile Service" }));

	const serviceProfile = new IdentityProfileService({
		profileEntityConnectorType: context.envVars.WORKBENCH_IDENTITY_PROFILE_CONNECTOR
	});
	services.push(serviceProfile);
	ServiceFactory.register(IDENTITY_PROFILE_SERVICE_NAME, () => serviceProfile);
}

/**
 * Initialise the identity profile connector factory.
 * @param context The context for the node.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseIdentityProfileConnectorFactory(
	context: IWorkbenchContext,
	services: IService[]
): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Identity Profile Connector Factory" })
	);

	const type = context.envVars.WORKBENCH_IDENTITY_PROFILE_CONNECTOR;

	let connector: IIdentityProfileConnector;
	let namespace: string;
	if (type === "entity-storage") {
		initSchemaIdentityStorage({ includeDocument: false });

		initialiseEntityStorageConnector(
			context,
			services,
			context.envVars.WORKBENCH_IDENTITY_PROFILE_ENTITY_STORAGE_TYPE,
			nameof<IdentityProfile>()
		);
		connector = new EntityStorageIdentityProfileConnector();
		namespace = EntityStorageIdentityProfileConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "identityProfileConnector"
		});
	}

	services.push(connector);
	IdentityProfileConnectorFactory.register(namespace, () => connector);
}
