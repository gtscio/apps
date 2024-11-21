// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-console */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IServerInfo } from "@twin.org/api-models";
import { BaseError, GeneralError, I18n, Is, type ILocaleDictionary } from "@twin.org/core";
import {
	buildEngineCoreConfiguration,
	EngineCore,
	EnvHelper,
	FileStateStorage,
	type IEngineCoreEnvironmentVariables
} from "@twin.org/engine-core";
import { EntityStorageComponentType, type IEngineCoreConfig } from "@twin.org/engine-models";
import {
	buildEngineServerConfiguration,
	EngineServer,
	type IEngineServerEnvironmentVariables
} from "@twin.org/engine-server";
import { EntitySchemaFactory, EntitySchemaHelper } from "@twin.org/entity";
import { nameof } from "@twin.org/nameof";
import * as dotenv from "dotenv";
import { bootstrap } from "./bootstrap.js";
import { UserAttestationEntry } from "./entities/userAttestationEntry.js";
import type { IWorkbenchState } from "./models/IWorkbenchState.js";

try {
	const serverInfo: IServerInfo = {
		name: "Workbench Server",
		version: "0.0.1-next.4"
	};

	console.log(`🌩️ ${serverInfo.name} v${serverInfo.version}`);

	const rootPackageFolder = findRootPackageFolder();
	await initialiseLocales(rootPackageFolder);

	dotenv.config({
		path: [path.join(rootPackageFolder, ".env")]
	});

	const envVars = EnvHelper.envToJson<
		IEngineCoreEnvironmentVariables & IEngineServerEnvironmentVariables
	>(process.env, "WORKBENCH_");
	if (!Is.stringValue(envVars.storageFileRoot)) {
		throw new GeneralError("Workbench", "storageFileRootNotSet");
	}

	const coreConfig = buildEngineCoreConfiguration(envVars);
	extendCoreConfig(coreConfig);
	const serverConfig = buildEngineServerConfiguration(envVars, coreConfig, serverInfo);

	const engineCore = new EngineCore<IWorkbenchState>({
		config: coreConfig,
		stateStorage: new FileStateStorage(envVars.stateFilename),
		customBootstrap: async (core, engineContext) => bootstrap(core, engineContext, envVars)
	});

	const engineServer = new EngineServer({ engineCore, server: serverConfig });

	await engineServer.start();

	for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"]) {
		process.on(signal, async () => {
			await engineServer.stop();
		});
	}
} catch (err) {
	console.error(BaseError.fromError(err));
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(1);
}

/**
 * Initialise the locales for the application.
 * @param rootPackageFolder The root package folder.
 */
export async function initialiseLocales(rootPackageFolder: string): Promise<void> {
	const localesDirectory = path.resolve(path.join(rootPackageFolder, "dist", "locales"));
	const enLangContent = await readFile(`${localesDirectory}/en.json`, "utf8");
	I18n.addDictionary("en", JSON.parse(enLangContent) as ILocaleDictionary);
}

/**
 * Find the root package folder.
 * @returns The root package folder.
 */
export function findRootPackageFolder(): string {
	// Find the root package folder.
	const rootPackageFolder = path.resolve(
		path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
	);

	return rootPackageFolder;
}

/**
 * Extends the core config with types specific to workbench.
 * @param engineCoreConfig The engine core configuration.
 */
function extendCoreConfig(engineCoreConfig: IEngineCoreConfig): void {
	engineCoreConfig.entityStorageComponent ??= [];

	EntitySchemaFactory.register(nameof<UserAttestationEntry>(), () =>
		EntitySchemaHelper.getSchema(UserAttestationEntry)
	);

	engineCoreConfig.entityStorageComponent.push({
		type: EntityStorageComponentType.Service,
		options: {
			entityStorageType: nameof<UserAttestationEntry>(),
			config: { includeNodeIdentity: true, includeUserIdentity: true }
		},
		restPath: "user-attestation"
	});
}
