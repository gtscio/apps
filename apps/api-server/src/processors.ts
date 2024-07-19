// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHttpRestRouteProcessor, IWebServerOptions } from "@gtsc/api-models";
import {
	RequestLoggingProcessor,
	ResponseLoggingProcessor,
	RouteProcessor,
	StaticIdentityProcessor,
	StaticPartitionProcessor
} from "@gtsc/api-processors";
import { Coerce, GeneralError } from "@gtsc/core";
import type { IService } from "@gtsc/services";

/**
 * Build the processor for the REST routes.
 * @param options The options for the web server.
 * @param options.webServerOptions The options for the web server.
 * @param options.rootPackageFolder The root package folder.
 * @param options.debug Whether to run in debug mode.
 * @param options.envVars The environment variables.
 * @param services The services.
 * @param systemLoggingConnectorName The name of the connector to use for system logging.
 * @returns The REST route processors.
 * @throws If the processor type is unknown.
 */
export function buildProcessors(
	options: {
		webServerOptions: IWebServerOptions;
		rootPackageFolder: string;
		debug: boolean;
		envVars: { [id: string]: string };
	},
	services: IService[],
	systemLoggingConnectorName: string
): IHttpRestRouteProcessor[] {
	const restRouteProcessors: IHttpRestRouteProcessor[] = [];

	restRouteProcessors.push(
		new RequestLoggingProcessor({
			loggingConnectorType: systemLoggingConnectorName,
			includeBody: options.debug
		})
	);

	const authProcessorType = options.envVars.GTSC_AUTH_PROCESSOR_TYPE;
	const authProcessorOptions = Coerce.object<{ [id: string]: unknown }>(
		options.envVars.GTSC_AUTH_PROCESSOR_OPTIONS
	);
	if (authProcessorType === "static") {
		restRouteProcessors.push(
			new StaticIdentityProcessor(authProcessorOptions as { identity: string })
		);
		// } else if (authProcessorType === "jwt") {
		// 	const key = Coerce.string(authProcessorOptions?.key) ?? "";
		// 	restRouteProcessors.push(new JwtIdentityProcessor({ key: Converter.base64ToBytes(key) }));
	} else {
		throw new GeneralError("apiServer", "processorUnknownType", {
			type: authProcessorType,
			processorType: "authProcessor"
		});
	}

	const partitionProcessorType = options.envVars.GTSC_PARTITION_PROCESSOR_TYPE;
	if (partitionProcessorType === "static") {
		restRouteProcessors.push(
			new StaticPartitionProcessor(
				Coerce.object(options.envVars.GTSC_PARTITION_PROCESSOR_OPTIONS) ?? { partitionId: "" }
			)
		);
	} else {
		throw new GeneralError("apiServer", "processorUnknownType", {
			type: authProcessorType,
			processorType: "partitionProcessor"
		});
	}

	restRouteProcessors.push(
		new RouteProcessor({
			includeErrorStack: options.debug
		})
	);

	restRouteProcessors.push(
		new ResponseLoggingProcessor({
			loggingConnectorType: systemLoggingConnectorName,
			includeBody: options.debug
		})
	);

	return restRouteProcessors;
}
