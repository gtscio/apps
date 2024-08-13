// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, I18n } from "@gtsc/core";
import type { IService } from "@gtsc/services";
import { EntityStorageFaucetConnector } from "@gtsc/wallet-connector-entity-storage";
import { IotaFaucetConnector } from "@gtsc/wallet-connector-iota";
import { FaucetConnectorFactory, type IFaucetConnector } from "@gtsc/wallet-models";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

/**
 * Initialise the faucet connector factory.
 * @param context The context for the node.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseFaucetConnectorFactory(
	context: IWorkbenchContext,
	services: IService[]
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Faucet Connector Factory" }));

	const type = context.envVars.WORKBENCH_FAUCET_CONNECTOR;

	let connector: IFaucetConnector;
	let namespace: string;

	if (type === "iota") {
		connector = new IotaFaucetConnector({
			config: {
				clientOptions: {
					nodes: [context.envVars.WORKBENCH_IOTA_NODE_URL],
					localPow: true
				},
				endpoint: context.envVars.WORKBENCH_IOTA_FAUCET_URL
			}
		});
		namespace = IotaFaucetConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		connector = new EntityStorageFaucetConnector();
		namespace = EntityStorageFaucetConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "faucetConnector"
		});
	}

	services.push(connector);
	FaucetConnectorFactory.register(namespace, () => connector);
}
