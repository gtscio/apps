// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ConsoleLoggingConnector } from "@gtsc/logging-connector-console";
import { LoggingConnectorFactory, SystemLoggingConnector } from "@gtsc/logging-models";
import type { IService } from "@gtsc/services";
import type { IOptions } from "../models/IOptions";

/**
 * Initialise the logging connector.
 * @param options The options for the web server.
 * @param services The services.
 */
export function initialiseLoggingConnector(options: IOptions, services: IService[]): void {
	// Create a regular console logger which automatically translates messages and hides groups.
	const loggingConnector = new ConsoleLoggingConnector({
		translateMessages: true,
		hideGroups: true
	});
	services.push(loggingConnector);
	LoggingConnectorFactory.register("logging", () => loggingConnector);

	// Create a system logging connector which wraps the console logger and automatically logs to the system partition.
	const systemLoggingConnector = new SystemLoggingConnector({
		loggingConnectorType: "logging",
		systemPartitionId: options.systemPartitionId
	});
	services.push(systemLoggingConnector);
	LoggingConnectorFactory.register(
		options.systemLoggingConnectorName,
		() => systemLoggingConnector
	);
}
