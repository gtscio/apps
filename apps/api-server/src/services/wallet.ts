// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, GeneralError, I18n } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IService } from "@gtsc/services";
import {
	EntityStorageWalletConnector,
	initSchema as initSchemaWallet,
	type WalletAddress
} from "@gtsc/wallet-connector-entity-storage";
import { IotaWalletConnector } from "@gtsc/wallet-connector-iota";
import { type IWalletConnector, WalletConnectorFactory } from "@gtsc/wallet-models";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { systemLogInfo } from "./logging.js";
import type { IOptions } from "../models/IOptions.js";

/**
 * Initialise the wallet connector factory.
 * @param options The options for the web server.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseWalletStorage(options: IOptions, services: IService[]): void {
	const type = options.envVars.GTSC_WALLET_CONNECTOR;

	if (type === "entity-storage") {
		initSchemaWallet();
		initialiseEntityStorageConnector(
			options,
			services,
			options.envVars.GTSC_NFT_ENTITY_STORAGE_TYPE,
			nameof<WalletAddress>()
		);
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "walletConnector"
		});
	}
}

/**
 * Initialise the wallet connector factory.
 * @param options The options for the web server.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseWalletConnectorFactory(options: IOptions, services: IService[]): void {
	systemLogInfo(
		I18n.formatMessage("apiServer.configuring", { element: "Wallet Connector Factory" })
	);

	const type = options.envVars.GTSC_WALLET_CONNECTOR;

	let connector: IWalletConnector;
	let namespace: string;

	if (type === "iota") {
		connector = new IotaWalletConnector({
			vaultConnectorType: options.envVars.GTSC_VAULT_CONNECTOR,
			faucetConnectorType: options.envVars.GTSC_FAUCET_CONNECTOR,
			config: {
				clientOptions: {
					nodes: [options.envVars.GTSC_IOTA_NODE_URL],
					localPow: true
				},
				coinType: Coerce.number(options.envVars.GTSC_IOTA_COIN_TYPE),
				bech32Hrp: options.envVars.GTSC_IOTA_BECH32_HRP
			}
		});
		namespace = IotaWalletConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		connector = new EntityStorageWalletConnector({
			vaultConnectorType: options.envVars.GTSC_VAULT_CONNECTOR,
			faucetConnectorType: options.envVars.GTSC_FAUCET_CONNECTOR
		});
		namespace = EntityStorageWalletConnector.NAMESPACE;
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "walletConnector"
		});
	}

	services.push(connector);
	WalletConnectorFactory.register(namespace, () => connector);
}
