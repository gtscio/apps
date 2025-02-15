// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-console */
import path from "node:path";
import type { IServerInfo } from "@twin.org/api-models";
import { GeneralError, Is } from "@twin.org/core";
import { buildEngineConfiguration, Engine } from "@twin.org/engine";
import { FileStateStorage } from "@twin.org/engine-core";
import { EngineCoreFactory, type IEngineStateStorage } from "@twin.org/engine-models";
import { buildEngineServerConfiguration, EngineServer } from "@twin.org/engine-server";
import type { IEngineServerConfig } from "@twin.org/engine-server-types";
import { BlobStorageConnectorType, EntityStorageConnectorType } from "@twin.org/engine-types";
import { bootstrap } from "./bootstrap.js";
import { extendEngineConfig } from "./extensions.js";
import type { IWorkbenchState } from "./models/IWorkbenchState.js";
import type { IWorkbenchVariables } from "./models/IWorkbenchVariables.js";

/**
 * Start the engine server.
 * @param serverInfo The server information.
 * @param envVars The environment variables.
 * @param rootPackageFolder The root package folder.
 * @param stateStorage The state storage.
 * @returns The engine server.
 */
export async function start(
	serverInfo: IServerInfo,
	envVars: IWorkbenchVariables,
	rootPackageFolder: string,
	stateStorage?: IEngineStateStorage
): Promise<{
	engine: Engine<IEngineServerConfig, IWorkbenchState>;
	server: EngineServer;
}> {
	envVars.storageFileRoot ??= "";

	if (
		(envVars.entityStorageConnectorType === EntityStorageConnectorType.File ||
			envVars.blobStorageConnectorType === BlobStorageConnectorType.File ||
			Is.empty(stateStorage)) &&
		!Is.stringValue(envVars.storageFileRoot)
	) {
		throw new GeneralError("Workbench", "storageFileRootNotSet");
	}

	// Build the engine configuration from the environment variables.
	const engineConfig = buildEngineConfiguration(envVars);
	// Extend the engine configuration with a custom type.
	extendEngineConfig(engineConfig);
	// Build the server configuration from the environment variables.
	const specFile = path.resolve(path.join(rootPackageFolder, "docs", "open-api", "spec.json"));
	const serverConfig = buildEngineServerConfiguration(envVars, engineConfig, serverInfo, specFile);

	// Create the engine instance using file state storage and custom bootstrap.
	const engine = new Engine<IEngineServerConfig, IWorkbenchState>({
		config: { ...engineConfig, ...serverConfig },
		stateStorage: stateStorage ?? new FileStateStorage(envVars.stateFilename ?? ""),
		customBootstrap: async (core, engineContext) => bootstrap(core, engineContext, envVars)
	});

	// Need to register the engine with the factory so that background tasks
	// can clone it to spawn new instances.
	EngineCoreFactory.register("engine", () => engine);

	// Construct the server with the engine.
	const server = new EngineServer({ engineCore: engine });

	// Start the server, which also starts the engine.
	await server.start();

	return {
		engine,
		server
	};
}
