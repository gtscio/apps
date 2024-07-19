// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { CLIDisplay } from "@gtsc/cli-core";
import { ErrorHelper, Is, type IError } from "@gtsc/core";
import { type ILoggingConnector, LoggingConnectorFactory } from "@gtsc/logging-models";

let loggingConnector: ILoggingConnector | undefined;
let showDetail: boolean;

/**
 * Initialise the logging connector.
 * @param loggingConnectorName The name of the logging connector.
 * @param debug Are we logging in debug mode, if so add more detail to the logs.
 */
export function logInit(loggingConnectorName: string, debug: boolean): void {
	loggingConnector = LoggingConnectorFactory.get(loggingConnectorName);
	showDetail = debug;
}

/**
 * Log info.
 * @param message The message to log.
 */
export function logInfo(message: string): void {
	loggingConnector?.log({
		source: "apiServer",
		level: "info",
		message
	});
}

/**
 * Log error.
 * @param error The error to log.
 */
export function logError(error: IError): void {
	const formattedErrors = ErrorHelper.localizeErrors(error);
	for (const formattedError of formattedErrors) {
		let message = Is.stringValue(formattedError.source)
			? `${formattedError.source}: ${formattedError.message}`
			: formattedError.message;
		if (showDetail && Is.stringValue(formattedError.stack)) {
			message += `\n${formattedError.stack}`;
		}
		if (loggingConnector) {
			loggingConnector.log({
				source: "apiServer",
				level: "error",
				message
			});
		} else {
			CLIDisplay.error(message);
		}
	}
}
