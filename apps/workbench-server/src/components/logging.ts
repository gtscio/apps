// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { CLIDisplay } from "@gtsc/cli-core";
import {
	ComponentFactory,
	ErrorHelper,
	GeneralError,
	I18n,
	Is,
	type IComponent,
	type IError
} from "@gtsc/core";
import { ConsoleLoggingConnector } from "@gtsc/logging-connector-console";
import {
	EntityStorageLoggingConnector,
	initSchema as initSchemaLogging,
	type LogEntry
} from "@gtsc/logging-connector-entity-storage";
import {
	LoggingConnectorFactory,
	MultiLoggingConnector,
	type ILoggingConnector
} from "@gtsc/logging-models";
import { LoggingService } from "@gtsc/logging-service";
import { nameof } from "@gtsc/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const LOGGING_SERVICE_NAME = "logging";

let nodeLoggingConnector: ILoggingConnector;
let showDetail: boolean;

/**
 * Initialise the logging connector.
 * @param context The context for the node.
 * @param components The components.
 */
export function initialiseNodeLoggingConnector(
	context: IWorkbenchContext,
	components: IComponent[]
): void {
	// Create a regular console logger which automatically translates messages and hides groups.
	// to display the node messages to the console
	const consoleLoggingConnector = new ConsoleLoggingConnector({
		translateMessages: true,
		hideGroups: true
	});
	components.push(consoleLoggingConnector);

	nodeLoggingConnector = consoleLoggingConnector;

	LoggingConnectorFactory.register(context.nodeLoggingConnectorName, () => consoleLoggingConnector);

	showDetail = context.debug;
}

/**
 * Initialise the logging service.
 * @param context The context for the node.
 * @param components The components.
 */
export function initialiseLoggingService(
	context: IWorkbenchContext,
	components: IComponent[]
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Logging Service" }));

	const service = new LoggingService();
	components.push(service);
	ComponentFactory.register(LOGGING_SERVICE_NAME, () => service);
}

/**
 * Initialise the logging connector factory.
 * @param context The context for the node.
 * @param components The components.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseLoggingConnectorFactory(
	context: IWorkbenchContext,
	components: IComponent[]
): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Logging Connector Factory" })
	);

	const types = context.envVars.WORKBENCH_LOGGING_CONNECTOR.split(",");

	for (const type of types) {
		let connector: ILoggingConnector;
		let namespace: string;
		if (type === "console") {
			connector = new ConsoleLoggingConnector({
				translateMessages: true,
				hideGroups: true
			});
			namespace = ConsoleLoggingConnector.NAMESPACE;
		} else if (type === "entity-storage") {
			initSchemaLogging();
			initialiseEntityStorageConnector(
				context,
				components,
				context.envVars.WORKBENCH_LOGGING_ENTITY_STORAGE_TYPE,
				nameof<LogEntry>()
			);
			connector = new EntityStorageLoggingConnector();
			namespace = EntityStorageLoggingConnector.NAMESPACE;
		} else {
			throw new GeneralError("Workbench", "serviceUnknownType", {
				type,
				serviceType: "loggingConnector"
			});
		}

		components.push(connector);
		LoggingConnectorFactory.register(namespace, () => connector);
	}

	// Create a multi logging connector which combines all the logging connectors.
	// and set the factory name to logging which is the default name other connectors
	// will use to get the logging connector.
	const multiConnector = new MultiLoggingConnector({
		loggingConnectorTypes: types
	});
	components.push(multiConnector);
	LoggingConnectorFactory.register("logging", () => multiConnector);
}

/**
 * Log info.
 * @param message The message to log.
 */
export function nodeLogInfo(message: string): void {
	nodeLoggingConnector?.log({
		source: "Workbench",
		level: "info",
		message
	});
}

/**
 * Log error.
 * @param error The error to log.
 */
export function nodeLogError(error: IError): void {
	const formattedErrors = ErrorHelper.localizeErrors(error);
	for (const formattedError of formattedErrors) {
		let message = Is.stringValue(formattedError.source)
			? `${formattedError.source}: ${formattedError.message}`
			: formattedError.message;
		if (showDetail && Is.stringValue(formattedError.stack)) {
			message += `\n${formattedError.stack}`;
		}
		if (nodeLoggingConnector) {
			nodeLoggingConnector.log({
				source: "Workbench",
				level: "error",
				message
			});
		} else {
			CLIDisplay.error(message);
		}
	}
}
