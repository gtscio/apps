// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AuthHeaderProcessor,
	EntityStorageAuthenticationService,
	initSchema as initSchemaAuthEntityStorage,
	type AuthenticationUser
} from "@twin.org/api-auth-entity-storage-service";
import type {
	IBaseRouteProcessor,
	IRestRouteProcessor,
	ISocketRouteProcessor
} from "@twin.org/api-models";
import {
	LoggingProcessor,
	NodeIdentityProcessor,
	RestRouteProcessor,
	SocketRouteProcessor
} from "@twin.org/api-processors";
import { ComponentFactory, GeneralError } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const AUTH_SERVICE_NAME = "authentication";
export const AUTH_SIGNING_NAME_VAULT_KEY = "auth-signing";

/**
 * Build the processor for the REST routes.
 * @param context The context for the node.
 * @returns The REST route processors.
 * @throws If the processor type is unknown.
 */
export function buildProcessors(context: IWorkbenchContext): {
	restRouteProcessors: IRestRouteProcessor[];
	socketRouteProcessors: ISocketRouteProcessor[];
} {
	const restRouteProcessors: IRestRouteProcessor[] = [];
	const socketRouteProcessors: ISocketRouteProcessor[] = [];

	const loggingProcessors = buildLoggingProcessors(context);
	restRouteProcessors.push(...loggingProcessors);
	socketRouteProcessors.push(...loggingProcessors);

	const nodeIdentityProcessor = new NodeIdentityProcessor();
	context.componentInstances.push({
		instanceName: "nodeIdentityProcessor",
		component: nodeIdentityProcessor
	});
	restRouteProcessors.push(nodeIdentityProcessor);
	socketRouteProcessors.push(nodeIdentityProcessor);

	const authProcessors = buildAuthProcessors(context);
	restRouteProcessors.push(...authProcessors);
	socketRouteProcessors.push(...authProcessors);

	const restRouteProcessor = new RestRouteProcessor({
		config: {
			includeErrorStack: context.debug
		}
	});
	restRouteProcessors.push(restRouteProcessor);
	context.componentInstances.push({
		instanceName: "restRouteProcessor",
		component: restRouteProcessor
	});

	const socketRouteProcessor = new SocketRouteProcessor({
		config: {
			includeErrorStack: context.debug
		}
	});
	socketRouteProcessors.push(socketRouteProcessor);
	context.componentInstances.push({
		instanceName: "socketRouteProcessor",
		component: socketRouteProcessor
	});

	return {
		restRouteProcessors,
		socketRouteProcessors
	};
}

/**
 * Build the logging processors.
 * @param context The context for the node.
 * @returns The logging processors.
 */
function buildLoggingProcessors(context: IWorkbenchContext): IBaseRouteProcessor[] {
	const loggingProcessor = new LoggingProcessor({
		loggingConnectorType: context.nodeLoggingConnectorName,
		config: {
			includeBody: context.debug
		}
	});
	context.componentInstances.push({
		instanceName: "loggingProcessor",
		component: loggingProcessor
	});
	return [loggingProcessor];
}

/**
 * Build the authentication pre processors.
 * @param context The context for the node.
 * @returns The authentication processors.
 * @throws If the auth processor type is unknown.
 */
function buildAuthProcessors(context: IWorkbenchContext): IBaseRouteProcessor[] {
	if (context.envVars.WORKBENCH_AUTH_PROCESSOR_TYPE === "entity-storage") {
		initSchemaAuthEntityStorage();
		initialiseEntityStorageConnector(
			context,
			context.envVars.WORKBENCH_AUTH_USER_ENTITY_STORAGE_TYPE,
			nameof<AuthenticationUser>()
		);

		const authenticationService = new EntityStorageAuthenticationService({
			vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
			config: {
				signingKeyName: AUTH_SIGNING_NAME_VAULT_KEY
			}
		});
		context.componentInstances.push({
			instanceName: "authenticationService",
			component: authenticationService
		});
		ComponentFactory.register(AUTH_SERVICE_NAME, () => authenticationService);

		const authHeaderProcessor = new AuthHeaderProcessor({
			vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
			config: {
				signingKeyName: AUTH_SIGNING_NAME_VAULT_KEY
			}
		});
		context.componentInstances.push({
			instanceName: "authHeaderProcessor",
			component: authHeaderProcessor
		});
		return [authHeaderProcessor];
	} else if (context.envVars.WORKBENCH_AUTH_PROCESSOR_TYPE !== "none") {
		throw new GeneralError("Workbench", "processorUnknownType", {
			type: context.envVars.WORKBENCH_AUTH_PROCESSOR_TYPE,
			processorType: "authProcessor"
		});
	}

	return [];
}
