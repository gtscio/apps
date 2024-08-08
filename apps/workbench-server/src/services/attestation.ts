// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageAttestationConnector } from "@gtsc/attestation-connector-entity-storage";
import { IotaAttestationConnector } from "@gtsc/attestation-connector-iota";
import { AttestationConnectorFactory, type IAttestationConnector } from "@gtsc/attestation-models";
import { AttestationService } from "@gtsc/attestation-service";
import { GeneralError, I18n } from "@gtsc/core";
import { ServiceFactory, type IService } from "@gtsc/services";
import { systemLogInfo } from "./logging.js";
import type { IOptions } from "../models/IOptions.js";

export const ATTESTATION_SERVICE_NAME = "attestation";

/**
 * Initialise the attestation service.
 * @param options The options for the web server.
 * @param services The services.
 */
export function initialiseAttestationService(options: IOptions, services: IService[]): void {
	systemLogInfo(I18n.formatMessage("apiServer.configuring", { element: "Attestation Service" }));

	const service = new AttestationService();
	services.push(service);
	ServiceFactory.register(ATTESTATION_SERVICE_NAME, () => service);
}

/**
 * Initialise the attestation connector factory.
 * @param options The options for the web server.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseAttestationConnectorFactory(
	options: IOptions,
	services: IService[]
): void {
	systemLogInfo(
		I18n.formatMessage("apiServer.configuring", { element: "Attestation Connector Factory" })
	);

	const type = options.envVars.SERVER_ATTESTATION_CONNECTOR;

	let connector: IAttestationConnector;
	let namespace: string;

	if (type === "iota") {
		connector = new IotaAttestationConnector({
			identityConnectorType: options.envVars.SERVER_IDENTITY_CONNECTOR,
			nftConnectorType: options.envVars.SERVER_NFT_CONNECTOR
		});
		namespace = IotaAttestationConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		connector = new EntityStorageAttestationConnector({
			identityConnectorType: options.envVars.SERVER_IDENTITY_CONNECTOR,
			nftConnectorType: options.envVars.SERVER_NFT_CONNECTOR
		});
		namespace = EntityStorageAttestationConnector.NAMESPACE;
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "attestationConnector"
		});
	}

	services.push(connector);
	AttestationConnectorFactory.register(namespace, () => connector);
}
