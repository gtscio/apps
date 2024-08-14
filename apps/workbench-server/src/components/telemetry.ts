// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ComponentFactory, GeneralError, I18n, type IComponent } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import {
	EntityStorageTelemetryConnector,
	initSchema as initSchemaTelemetry,
	type TelemetryMetric,
	type TelemetryMetricValue
} from "@gtsc/telemetry-connector-entity-storage";
import { TelemetryConnectorFactory, type ITelemetryConnector } from "@gtsc/telemetry-models";
import { TelemetryService } from "@gtsc/telemetry-service";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const TELEMETRY_SERVICE_NAME = "telemetry";

/**
 * Initialise the telemetry service.
 * @param context The context for the node.
 * @param components The components.
 */
export function initialiseTelemetryService(
	context: IWorkbenchContext,
	components: IComponent[]
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Telemetry Service" }));

	const service = new TelemetryService({
		telemetryConnectorType: context.envVars.WORKBENCH_TELEMETRY_CONNECTOR
	});
	components.push(service);
	ComponentFactory.register(TELEMETRY_SERVICE_NAME, () => service);
}

/**
 * Initialise the telemetry connector factory.
 * @param context The context for the node.
 * @param components The components.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseTelemetryConnectorFactory(
	context: IWorkbenchContext,
	components: IComponent[]
): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Telemetry Connector Factory" })
	);

	const type = context.envVars.WORKBENCH_TELEMETRY_CONNECTOR;

	let connector: ITelemetryConnector;
	let namespace: string;
	if (type === "entity-storage") {
		initSchemaTelemetry();
		initialiseEntityStorageConnector(
			context,
			components,
			context.envVars.WORKBENCH_TELEMETRY_ENTITY_STORAGE_TYPE,
			nameof<TelemetryMetric>()
		);
		initialiseEntityStorageConnector(
			context,
			components,
			context.envVars.WORKBENCH_TELEMETRY_ENTITY_STORAGE_TYPE,
			nameof<TelemetryMetricValue>()
		);
		connector = new EntityStorageTelemetryConnector({
			loggingConnectorType: "logging"
		});
		namespace = EntityStorageTelemetryConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "telemetryConnector"
		});
	}

	components.push(connector);
	TelemetryConnectorFactory.register(namespace, () => connector);
}
