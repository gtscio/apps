// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, I18n } from "@gtsc/core";
import type { IService } from "@gtsc/services";
import { EntityStorageFaucetConnector } from "@gtsc/wallet-connector-entity-storage";
import { IotaFaucetConnector } from "@gtsc/wallet-connector-iota";
import { FaucetConnectorFactory, type IFaucetConnector } from "@gtsc/wallet-models";
import { systemLogInfo } from "./logging.js";
import type { IOptions } from "../models/IOptions.js";

/**
 * Initialise the faucet connector factory.
 * @param options The options for the web server.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseFaucetConnectorFactory(options: IOptions, services: IService[]): void {
	systemLogInfo(
		I18n.formatMessage("apiServer.configuring", { element: "Faucet Connector Factory" })
	);

	const type = options.envVars.SERVER_FAUCET_CONNECTOR;

	let connector: IFaucetConnector;
	let namespace: string;

	if (type === "iota") {
		connector = new IotaFaucetConnector({
			config: {
				clientOptions: {
					nodes: [options.envVars.SERVER_IOTA_NODE_URL],
					localPow: true
				},
				endpoint: options.envVars.SERVER_IOTA_FAUCET_URL
			}
		});
		namespace = IotaFaucetConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		connector = new EntityStorageFaucetConnector();
		namespace = EntityStorageFaucetConnector.NAMESPACE;
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "faucetConnector"
		});
	}

	services.push(connector);
	FaucetConnectorFactory.register(namespace, () => connector);
}
