// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IRestRouteProcessor,
	IRestRoute,
	ISocketRouteProcessor,
	ISocketRoute
} from "@twin.org/api-models";
import { JwtMimeTypeProcessor } from "@twin.org/api-processors";
import { FastifyWebServer } from "@twin.org/api-server-fastify";
import { Is } from "@twin.org/core";
import type { IWorkbenchContext } from "./models/IWorkbenchContext";

/**
 * Starts the web server.
 * @param context The context for the node.
 * @param restRouteProcessors The REST route processors.
 * @param restRoutes The REST routes to serve.
 * @param socketRouteProcessors The socket route processors.
 * @param socketRoutes The socket routes to serve.
 * @param stopCallback Callback to call when the server is stopped.
 */
export async function startWebServer(
	context: IWorkbenchContext,
	restRouteProcessors: IRestRouteProcessor[],
	restRoutes: IRestRoute[],
	socketRouteProcessors: ISocketRouteProcessor[],
	socketRoutes: ISocketRoute[],
	stopCallback?: () => Promise<void>
): Promise<void> {
	const webServer = new FastifyWebServer({
		loggingConnectorType: context.nodeLoggingConnectorName,
		mimeTypeProcessors: [new JwtMimeTypeProcessor()]
	});

	await webServer.build(
		restRouteProcessors,
		restRoutes,
		socketRouteProcessors,
		socketRoutes,
		context.webServerOptions
	);
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
