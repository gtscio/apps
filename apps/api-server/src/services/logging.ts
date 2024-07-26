// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { CLIDisplay } from "@gtsc/cli-core";
import { ErrorHelper, type IError, Is } from "@gtsc/core";
import { ConsoleLoggingConnector } from "@gtsc/logging-connector-console";
import {
	type ILoggingConnector,
	LoggingConnectorFactory,
	SystemLoggingConnector
} from "@gtsc/logging-models";
import type { IService } from "@gtsc/services";
import type { IOptions } from "../models/IOptions";

let systemLoggingConnector: ILoggingConnector;
let showDetail: boolean;

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
	systemLoggingConnector = new SystemLoggingConnector({
		loggingConnectorType: "logging",
		systemPartitionId: options.systemConfig.systemPartitionId
	});
	services.push(systemLoggingConnector);
	LoggingConnectorFactory.register(
		options.systemLoggingConnectorName,
		() => systemLoggingConnector
	);

	showDetail = options.debug;
}

/**
 * Log info.
 * @param message The message to log.
 */
export function systemLogInfo(message: string): void {
	systemLoggingConnector?.log({
		source: "apiServer",
		level: "info",
		message
	});
}

/**
 * Log error.
 * @param error The error to log.
 */
export function systemLogError(error: IError): void {
	const formattedErrors = ErrorHelper.localizeErrors(error);
	for (const formattedError of formattedErrors) {
		let message = Is.stringValue(formattedError.source)
			? `${formattedError.source}: ${formattedError.message}`
			: formattedError.message;
		if (showDetail && Is.stringValue(formattedError.stack)) {
			message += `\n${formattedError.stack}`;
		}
		if (systemLoggingConnector) {
			systemLoggingConnector.log({
				source: "apiServer",
				level: "error",
				message
			});
		} else {
			CLIDisplay.error(message);
		}
	}
}
