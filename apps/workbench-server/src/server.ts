// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-console */
import type { IServerInfo } from "@twin.org/api-models";
import { GeneralError, Is } from "@twin.org/core";
import { buildEngineConfiguration, Engine } from "@twin.org/engine";
import { FileStateStorage } from "@twin.org/engine-core";
import type { IEngineStateStorage } from "@twin.org/engine-models";
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
 * @param stateStorage The state storage.
 * @returns The engine server.
 */
export async function start(
	serverInfo: IServerInfo,
	envVars: IWorkbenchVariables,
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

	const engineConfig = buildEngineConfiguration(envVars);
	extendEngineConfig(engineConfig);
	const serverConfig = buildEngineServerConfiguration(envVars, engineConfig, serverInfo);

	const engine = new Engine<IEngineServerConfig, IWorkbenchState>({
		config: { ...engineConfig, ...serverConfig },
		stateStorage: stateStorage ?? new FileStateStorage(envVars.stateFilename ?? ""),
		customBootstrap: async (core, engineContext) => bootstrap(core, engineContext, envVars)
	});

	const server = new EngineServer({ engineCore: engine });

	await server.start();
	return {
		engine,
		server
	};
}
