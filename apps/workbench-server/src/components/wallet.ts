// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, GeneralError, I18n, type IComponent } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import {
	EntityStorageWalletConnector,
	initSchema as initSchemaWallet,
	type WalletAddress
} from "@gtsc/wallet-connector-entity-storage";
import { IotaWalletConnector } from "@gtsc/wallet-connector-iota";
import { WalletConnectorFactory, type IWalletConnector } from "@gtsc/wallet-models";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

/**
 * Initialise the wallet connector factory.
 * @param context The context for the node.
 * @param components The components.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseWalletStorage(
	context: IWorkbenchContext,
	components: IComponent[]
): void {
	const type = context.envVars.WORKBENCH_WALLET_CONNECTOR;

	if (type === "iota") {
		// No storage required for IOTA wallet connector.
	} else if (type === "entity-storage") {
		initSchemaWallet();
		initialiseEntityStorageConnector(
			context,
			components,
			context.envVars.WORKBENCH_NFT_ENTITY_STORAGE_TYPE,
			nameof<WalletAddress>()
		);
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "walletConnector"
		});
	}
}

/**
 * Initialise the wallet connector factory.
 * @param context The context for the node.
 * @param components The components.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseWalletConnectorFactory(
	context: IWorkbenchContext,
	components: IComponent[]
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Wallet Connector Factory" }));

	const type = context.envVars.WORKBENCH_WALLET_CONNECTOR;

	let connector: IWalletConnector;
	let namespace: string;

	if (type === "iota") {
		connector = new IotaWalletConnector({
			vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
			faucetConnectorType: context.envVars.WORKBENCH_FAUCET_CONNECTOR,
			config: {
				clientOptions: {
					nodes: [context.envVars.WORKBENCH_IOTA_NODE_URL],
					localPow: true
				},
				coinType: Coerce.number(context.envVars.WORKBENCH_IOTA_COIN_TYPE),
				bech32Hrp: context.envVars.WORKBENCH_IOTA_BECH32_HRP
			}
		});
		namespace = IotaWalletConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		connector = new EntityStorageWalletConnector({
			vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
			faucetConnectorType: context.envVars.WORKBENCH_FAUCET_CONNECTOR
		});
		namespace = EntityStorageWalletConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "walletConnector"
		});
	}

	components.push(connector);
	WalletConnectorFactory.register(namespace, () => connector);
}
