// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageAttestationConnector } from "@gtsc/attestation-connector-entity-storage";
import { IotaAttestationConnector } from "@gtsc/attestation-connector-iota";
import { AttestationConnectorFactory, type IAttestationConnector } from "@gtsc/attestation-models";
import { AttestationService } from "@gtsc/attestation-service";
import { ComponentFactory, GeneralError, I18n } from "@gtsc/core";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const ATTESTATION_SERVICE_NAME = "attestation";
export const ATTESTATION_ASSERTION_METHOD_ID = "attestation";

/**
 * Initialise the attestation service.
 * @param context The context for the node.
 */
export function initialiseAttestationService(context: IWorkbenchContext): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Attestation Service" }));

	const service = new AttestationService({
		walletConnectorType: context.envVars.WORKBENCH_WALLET_CONNECTOR
	});
	context.componentInstances.push({ instanceName: ATTESTATION_SERVICE_NAME, component: service });
	ComponentFactory.register(ATTESTATION_SERVICE_NAME, () => service);
}

/**
 * Initialise the attestation connector factory.
 * @param context The context for the node.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseAttestationConnectorFactory(context: IWorkbenchContext): void {
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

	context.componentInstances.push({ instanceName: namespace, component: connector });
	AttestationConnectorFactory.register(namespace, () => connector);
}
