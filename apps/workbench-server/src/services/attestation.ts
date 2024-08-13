// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageAttestationConnector } from "@gtsc/attestation-connector-entity-storage";
import { IotaAttestationConnector } from "@gtsc/attestation-connector-iota";
import { AttestationConnectorFactory, type IAttestationConnector } from "@gtsc/attestation-models";
import { AttestationService } from "@gtsc/attestation-service";
import { GeneralError, I18n } from "@gtsc/core";
import { ServiceFactory, type IService } from "@gtsc/services";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const ATTESTATION_SERVICE_NAME = "attestation";

/**
 * Initialise the attestation service.
 * @param context The context for the node.
 * @param services The services.
 */
export function initialiseAttestationService(
	context: IWorkbenchContext,
	services: IService[]
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Attestation Service" }));

	const service = new AttestationService();
	services.push(service);
	ServiceFactory.register(ATTESTATION_SERVICE_NAME, () => service);
}

/**
 * Initialise the attestation connector factory.
 * @param context The context for the node.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseAttestationConnectorFactory(
	context: IWorkbenchContext,
	services: IService[]
): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Attestation Connector Factory" })
	);

	const type = context.envVars.WORKBENCH_ATTESTATION_CONNECTOR;

	let connector: IAttestationConnector;
	let namespace: string;

	if (type === "iota") {
		connector = new IotaAttestationConnector({
			identityConnectorType: context.envVars.WORKBENCH_IDENTITY_CONNECTOR,
			nftConnectorType: context.envVars.WORKBENCH_NFT_CONNECTOR
		});
		namespace = IotaAttestationConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		connector = new EntityStorageAttestationConnector({
			identityConnectorType: context.envVars.WORKBENCH_IDENTITY_CONNECTOR,
			nftConnectorType: context.envVars.WORKBENCH_NFT_CONNECTOR
		});
		namespace = EntityStorageAttestationConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "attestationConnector"
		});
	}

	services.push(connector);
	AttestationConnectorFactory.register(namespace, () => connector);
}
