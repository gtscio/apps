// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	localeProcessor,
	requestLoggingProcessor,
	responseLoggingProcessor,
	routeProcessor
} from "@gtsc/api-core";
import type { HttpRestRouteProcessor, IRestRoute, IWebServerOptions } from "@gtsc/api-models";
import { FastifyWebServer } from "@gtsc/api-server-fastify";

/**
 * Starts the web server.
 * @param options The options for the web server.
 * @param options.webServerOptions The options for the web server.
 * @param options.rootPackageFolder The root package folder.
 * @param options.debug Whether to run in debug mode.
 * @param routes The routes to serve.
 */
export async function startWebServer(options: {
	webServerOptions: IWebServerOptions;
	rootPackageFolder: string;
	debug: boolean;
}, routes: IRestRoute[]): Promise<void> {
	const webServer = new FastifyWebServer();

	const restRouteProcessors: HttpRestRouteProcessor[] = [
		localeProcessor,
		async (requestContext, request, response, route, state): Promise<void> =>
			requestLoggingProcessor(requestContext, request, response, route, state, {
				includeBody: options.debug
			}),
		async (requestContext, request, response, route, state): Promise<void> =>
			routeProcessor(requestContext, request, response, route, state, {
				includeErrorStack: options.debug
			}),
		async (requestContext, request, response, route, state): Promise<void> =>
			responseLoggingProcessor(requestContext, request, response, route, state, {
				includeBody: options.debug
			})
	];

	await webServer.build(restRouteProcessors, routes, options.webServerOptions);
	await webServer.start();

	for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"]) {
		process.on(signal, () => webServer.stop());
	}
}
