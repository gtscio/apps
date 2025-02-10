// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import type {	ILogEntry } from "@twin.org/logging-models";
import { LoggingClient } from "@twin.org/logging-rest-client";

let loggingClient: LoggingClient | undefined;

/**
 * Initialise the logging.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	loggingClient = new LoggingClient({
		endpoint: apiUrl
	});
}

/**
 * Verify a logging data.
 * @returns The id of the logging or an error if one occurred.
 */
export async function loggingResolve(): Promise<
	| {
		error?: string;
		entities?: ILogEntry[];
    cursor?: string;
	  }
	| undefined
> {
	if (Is.object(loggingClient)) {
		try {
			const result = await loggingClient.query();
			// eslint-disable-next-line no-console
			console.log("result", result);
			return result;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
