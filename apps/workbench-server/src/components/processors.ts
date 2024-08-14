// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AuthHeaderProcessor,
	EntityStorageAuthenticationService,
	initSchema as initSchemaAuthEntityStorage,
	type AuthenticationUser
} from "@gtsc/api-auth-entity-storage-service";
import type { IHttpRestRouteProcessor } from "@gtsc/api-models";
import { LoggingProcessor, NodeIdentityProcessor, RouteProcessor } from "@gtsc/api-processors";
import { ComponentFactory, GeneralError, type IComponent } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const AUTH_SERVICE_NAME = "authentication";
export const AUTH_SIGNING_NAME_VAULT_KEY = "signing";

/**
 * Build the processor for the REST routes.
 * @param context The context for the node.
 * @param components The components.
 * @returns The REST route processors.
 * @throws If the processor type is unknown.
 */
export function buildProcessors(
	context: IWorkbenchContext,
	components: IComponent[]
): IHttpRestRouteProcessor[] {
	const restRouteProcessors: IHttpRestRouteProcessor[] = [];

	restRouteProcessors.push(
		new LoggingProcessor({
			loggingConnectorType: context.nodeLoggingConnectorName,
			config: {
				includeBody: context.debug
			}
		})
	);

	restRouteProcessors.push(new NodeIdentityProcessor());

	buildAuthProcessors(context, restRouteProcessors, components);

	restRouteProcessors.push(
		new RouteProcessor({
			config: {
				includeErrorStack: context.debug
			}
		})
	);

	components.push(...restRouteProcessors);

	return restRouteProcessors;
}

/**
 * Build the authentication pre processors.
 * @param context The context for the node.
 * @param restRouteProcessors The REST route processors.
 * @param components The components.
 * @throws If the auth processor type is unknown.
 */
function buildAuthProcessors(
	context: IWorkbenchContext,
	restRouteProcessors: IHttpRestRouteProcessor[],
	components: IComponent[]
): void {
	if (context.envVars.WORKBENCH_AUTH_PROCESSOR_TYPE === "entity-storage") {
		initSchemaAuthEntityStorage();
		initialiseEntityStorageConnector(
			context,
			components,
			context.envVars.WORKBENCH_AUTH_USER_ENTITY_STORAGE_TYPE,
			nameof<AuthenticationUser>()
		);

		const authenticationService = new EntityStorageAuthenticationService({
			vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
			config: {
				signingKeyName: AUTH_SIGNING_NAME_VAULT_KEY
			}
		});
		components.push(authenticationService);

		ComponentFactory.register(AUTH_SERVICE_NAME, () => authenticationService);

		restRouteProcessors.push(
			new AuthHeaderProcessor({
				vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
				config: {
					signingKeyName: AUTH_SIGNING_NAME_VAULT_KEY
				}
			})
		);
	} else if (context.envVars.WORKBENCH_AUTH_PROCESSOR_TYPE !== "none") {
		throw new GeneralError("Workbench", "processorUnknownType", {
			type: context.envVars.WORKBENCH_AUTH_PROCESSOR_TYPE,
			processorType: "authProcessor"
		});
	}
}
