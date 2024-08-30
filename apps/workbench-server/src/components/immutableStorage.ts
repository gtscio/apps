// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, GeneralError, I18n } from "@gtsc/core";
import {
	EntityStorageImmutableStorageConnector,
	initSchema as initSchemaImmutableStorage,
	type ImmutableItem
} from "@gtsc/immutable-storage-connector-entity-storage";
import { IotaImmutableStorageConnector } from "@gtsc/immutable-storage-connector-iota";
import {
	ImmutableStorageConnectorFactory,
	type IImmutableStorageConnector
} from "@gtsc/immutable-storage-models";
import { nameof } from "@gtsc/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

/**
 * Initialise the immutable storage connector factory.
 * @param context The context for the node.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseImmutableStorageConnectorFactory(context: IWorkbenchContext): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Immutable Storage Connector Factory" })
	);

	const type = context.envVars.WORKBENCH_IMMUTABLE_STORAGE_CONNECTOR;

	let connector: IImmutableStorageConnector;
	let namespace: string;
	if (type === "iota") {
		connector = new IotaImmutableStorageConnector({
			vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
			config: {
				clientOptions: {
					nodes: [context.envVars.WORKBENCH_IOTA_NODE_URL],
					localPow: true
				},
				coinType: Coerce.number(context.envVars.WORKBENCH_IOTA_COIN_TYPE)
			}
		});
		namespace = IotaImmutableStorageConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		initSchemaImmutableStorage();
		initialiseEntityStorageConnector(
			context,
			context.envVars.WORKBENCH_IMMUTABLE_STORAGE_ENTITY_STORAGE_TYPE,
			nameof<ImmutableItem>()
		);
		connector = new EntityStorageImmutableStorageConnector();
		namespace = EntityStorageImmutableStorageConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "immutableStorageConnector"
		});
	}

	context.componentInstances.push({ instanceName: namespace, component: connector });
	ImmutableStorageConnectorFactory.register(namespace, () => connector);
}
