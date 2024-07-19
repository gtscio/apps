// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHttpRestRouteProcessor, IRestRoute, IWebServerOptions } from "@gtsc/api-models";
import { FastifyWebServer } from "@gtsc/api-server-fastify";
import { Is } from "@gtsc/core";
import { LoggingConnectorFactory } from "@gtsc/logging-models";

/**
 * Starts the web server.
 * @param options The options for the web server.
 * @param options.webServerOptions The options for the web server.
 * @param options.rootPackageFolder The root package folder.
 * @param options.debug Whether to run in debug mode.
 * @param options.envVars The environment variables.
 * @param restRouteProcessors The REST route processors.
 * @param routes The routes to serve.
 * @param systemLoggingConnectorName The name of the connector to use for system logging.
 * @param stopCallback Callback to call when the server is stopped.
 */
export async function startWebServer(
	options: {
		webServerOptions: IWebServerOptions;
		rootPackageFolder: string;
		debug: boolean;
		envVars: { [id: string]: string };
	},
	restRouteProcessors: IHttpRestRouteProcessor[],
	routes: IRestRoute[],
	systemLoggingConnectorName: string,
	stopCallback?: () => Promise<void>
): Promise<void> {
	const logging = LoggingConnectorFactory.get(systemLoggingConnectorName);
	const webServer = new FastifyWebServer(logEntry => logging.log(logEntry));

	await webServer.build(restRouteProcessors, routes, options.webServerOptions);
	await webServer.start();

	for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"]) {
		process.on(signal, async () => {
			webServer.stop();
			if (Is.function(stopCallback)) {
				await stopCallback();
			}
		});
	}
}
