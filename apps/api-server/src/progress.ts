// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { CLIDisplay } from "@gtsc/cli-core";
import { ErrorHelper, Is, type IError } from "@gtsc/core";
import { type ILoggingConnector, LoggingConnectorFactory } from "@gtsc/logging-models";
import type { IOptions } from "./models/IOptions";

let loggingConnector: ILoggingConnector | undefined;
let showDetail: boolean;

/**
 * Initialise the logging connector.
 * @param options The options for the web server.
 */
export function systemLogInit(options: IOptions): void {
	loggingConnector = LoggingConnectorFactory.get(options.systemLoggingConnectorName);
	showDetail = options.debug;
}

/**
 * Log info.
 * @param message The message to log.
 */
export function systemLogInfo(message: string): void {
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
export function systemLogError(error: IError): void {
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
