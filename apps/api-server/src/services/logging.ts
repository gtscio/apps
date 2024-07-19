// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ConsoleLoggingConnector } from "@gtsc/logging-connector-console";
import { LoggingConnectorFactory } from "@gtsc/logging-models";
import type { IService } from "@gtsc/services";

/**
 * Initialise the logging connector.
 * @param envVars The environment variables.
 * @param services The services.
 * @param systemLoggingConnectorName The name of the connector to use for system logging.
 */
export function initialiseLoggingConnector(
	envVars: { [id: string]: string },
	services: IService[],
	systemLoggingConnectorName: string
): void {
	const loggingConnector = new ConsoleLoggingConnector({
		translateMessages: true,
		hideGroups: true
	});
	services.push(loggingConnector);
	LoggingConnectorFactory.register("logging", () => loggingConnector);
	LoggingConnectorFactory.register(systemLoggingConnectorName, () => loggingConnector);
}
