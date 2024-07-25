// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import {
	type AuthenticationUser,
	EntityStorageAuthenticationProcessor,
	EntityStorageAuthenticationService,
	initSchema as initSchemaAuthEntityStorage
} from "@gtsc/api-auth-entity-storage-service";
import type { IHttpRestRouteProcessor } from "@gtsc/api-models";
import {
	type ApiKey,
	ApiKeyPartitionProcessor,
	initSchema as initSchemaApi,
	type IStaticIdentityProcessorConfig,
	type IStaticPartitionProcessorConfig,
	RequestLoggingProcessor,
	ResponseLoggingProcessor,
	RouteProcessor,
	StaticIdentityProcessor,
	StaticPartitionProcessor
} from "@gtsc/api-processors";
import { Coerce, GeneralError } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import { ServiceFactory, type IService } from "@gtsc/services";
import type { EntityStorageTypes } from "./models/entityStorage/entityStorageTypes.js";
import type { IOptions } from "./models/IOptions.js";
import { initialiseEntityStorageConnector } from "./services/entityStorage.js";

export const AUTH_SERVICE_NAME = "authentication";

/**
 * Build the processor for the REST routes.
 * @param options The options for the web server.
 * @param services The services.
 * @returns The REST route processors.
 * @throws If the processor type is unknown.
 */
export function buildProcessors(
	options: IOptions,
	services: IService[]
): IHttpRestRouteProcessor[] {
	const restRouteProcessors: IHttpRestRouteProcessor[] = [];

	restRouteProcessors.push(
		new RequestLoggingProcessor({
			loggingConnectorType: options.systemLoggingConnectorName,
			config: {
				includeBody: options.debug
			}
		})
	);

	buildPartitionProcessors(options, restRouteProcessors, services);

	buildAuthProcessors(options, restRouteProcessors, services);

	restRouteProcessors.push(
		new RouteProcessor({
			config: {
				includeErrorStack: options.debug
			}
		})
	);

	restRouteProcessors.push(
		new ResponseLoggingProcessor({
			loggingConnectorType: options.systemLoggingConnectorName,
			config: {
				includeBody: options.debug
			}
		})
	);

	services.push(...restRouteProcessors);

	return restRouteProcessors;
}

/**
 * Build the authentication processors.
 * @param options The options for the web server.
 * @param restRouteProcessors The REST route processors.
 * @param services The services.
 * @throws If the auth processor type is unknown.
 */
function buildAuthProcessors(
	options: IOptions,
	restRouteProcessors: IHttpRestRouteProcessor[],
	services: IService[]
): void {
	if (options.envVars.GTSC_AUTH_PROCESSOR_TYPE === "static") {
		restRouteProcessors.push(
			new StaticIdentityProcessor({
				config: Coerce.object(
					options.envVars.GTSC_AUTH_USER_STATIC_OPTIONS
				) as IStaticIdentityProcessorConfig
			})
		);
	} else if (options.envVars.GTSC_AUTH_PROCESSOR_TYPE === "entity-storage") {
		initSchemaAuthEntityStorage();
		initialiseEntityStorageConnector(options, services, {
			type: options.envVars.GTSC_AUTH_USER_ENTITY_STORAGE_TYPE as EntityStorageTypes,
			schema: nameof<AuthenticationUser>(),
			storageName: "authentication-user",
			config: {
				directory: path.join(options.envVars.GTSC_ENTITY_STORAGE_FILE_ROOT, "auth-user")
			}
		});

		const authenticationService = new EntityStorageAuthenticationService();
		services.push(authenticationService);

		ServiceFactory.register(AUTH_SERVICE_NAME, () => authenticationService);

		restRouteProcessors.push(new EntityStorageAuthenticationProcessor());
	} else {
		throw new GeneralError("apiServer", "processorUnknownType", {
			type: options.envVars.GTSC_AUTH_PROCESSOR_TYPE,
			processorType: "authProcessor"
		});
	}
}

/**
 * Build the partition processors.
 * @param options The options for the web server.
 * @param restRouteProcessors The REST route processors.
 * @param services The services.
 * @throws If the partition processor type is unknown.
 */
function buildPartitionProcessors(
	options: IOptions,
	restRouteProcessors: IHttpRestRouteProcessor[],
	services: IService[]
): void {
	if (options.envVars.GTSC_PARTITION_PROCESSOR_TYPE === "static") {
		restRouteProcessors.push(
			new StaticPartitionProcessor({
				config: Coerce.object(
					options.envVars.GTSC_PARTITION_STATIC_OPTIONS
				) as IStaticPartitionProcessorConfig
			})
		);
	} else if (options.envVars.GTSC_PARTITION_PROCESSOR_TYPE === "api-key") {
		initSchemaApi();
		initialiseEntityStorageConnector(options, services, {
			type: options.envVars.GTSC_PARTITION_API_KEY_ENTITY_STORAGE_TYPE as EntityStorageTypes,
			schema: nameof<ApiKey>(),
			storageName: "api-key",
			config: {
				directory: path.join(options.envVars.GTSC_ENTITY_STORAGE_FILE_ROOT, "api-key")
			}
		});
		restRouteProcessors.push(new ApiKeyPartitionProcessor());
	} else {
		throw new GeneralError("apiServer", "processorUnknownType", {
			type: options.envVars.GTSC_PARTITION_PROCESSOR_TYPE,
			processorType: "partitionProcessor"
		});
	}
}
