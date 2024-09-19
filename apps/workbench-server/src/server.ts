// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHttpRestRouteProcessor, IRestRoute } from "@twin.org/api-models";
import { FastifyWebServer } from "@twin.org/api-server-fastify";
import { Is } from "@twin.org/core";
import type { IWorkbenchContext } from "./models/IWorkbenchContext";

/**
 * Starts the web server.
 * @param context The context for the node.
 * @param restRouteProcessors The REST route processors.
 * @param routes The routes to serve.
 * @param stopCallback Callback to call when the server is stopped.
 */
export async function startWebServer(
	context: IWorkbenchContext,
	restRouteProcessors: IHttpRestRouteProcessor[],
	routes: IRestRoute[],
	stopCallback?: () => Promise<void>
): Promise<void> {
	const webServer = new FastifyWebServer({
		loggingConnectorType: context.nodeLoggingConnectorName
	});

	await webServer.build(restRouteProcessors, routes, context.webServerOptions);
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
