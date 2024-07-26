// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, GeneralError, I18n } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import {
	EntityStorageNftConnector,
	initSchema as initSchemaNft,
	type Nft
} from "@gtsc/nft-connector-entity-storage";
import { IotaNftConnector } from "@gtsc/nft-connector-iota";
import { NftConnectorFactory, type INftConnector } from "@gtsc/nft-models";
import { NftService } from "@gtsc/nft-service";
import { ServiceFactory, type IService } from "@gtsc/services";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { systemLogInfo } from "./logging.js";
import type { IOptions } from "../models/IOptions.js";

export const NFT_SERVICE_NAME = "nft";

/**
 * Initialise the NFT service.
 * @param options The options for the web server.
 * @param services The services.
 */
export function initialiseNftService(options: IOptions, services: IService[]): void {
	systemLogInfo(I18n.formatMessage("apiServer.configuring", { element: "NFT Service" }));

	const service = new NftService();
	services.push(service);
	ServiceFactory.register(NFT_SERVICE_NAME, () => service);
}

/**
 * Initialise the NFT connector factory.
 * @param options The options for the web server.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseNftConnectorFactory(options: IOptions, services: IService[]): void {
	systemLogInfo(I18n.formatMessage("apiServer.configuring", { element: "NFT Connector Factory" }));

	const type = options.envVars.GTSC_NFT_CONNECTOR;

	let connector: INftConnector;
	let namespace: string;

	if (type === "iota") {
		connector = new IotaNftConnector({
			config: {
				clientOptions: {
					nodes: [options.envVars.GTSC_IOTA_NODE_URL],
					localPow: true
				},
				coinType: Coerce.number(options.envVars.GTSC_IOTA_COIN_TYPE)
			}
		});
		namespace = IotaNftConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		initSchemaNft();
		initialiseEntityStorageConnector(
			options,
			services,
			options.envVars.GTSC_NFT_ENTITY_STORAGE_TYPE,
			nameof<Nft>()
		);
		connector = new EntityStorageNftConnector();
		namespace = EntityStorageNftConnector.NAMESPACE;
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "nftConnector"
		});
	}

	services.push(connector);
	NftConnectorFactory.register(namespace, () => connector);
}
