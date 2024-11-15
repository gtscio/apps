// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-console */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IServerInfo } from "@twin.org/api-models";
import { BaseError, I18n, type ILocaleDictionary } from "@twin.org/core";
import { EngineCore, FileStateStorage } from "@twin.org/engine-core";
import { EngineServer } from "@twin.org/engine-server";
import { bootstrap } from "./bootstrap.js";
import { configure } from "./configure.js";
import type { IWorkbenchState } from "./models/IWorkbenchState.js";

try {
	const serverInfo: IServerInfo = {
		name: "Workbench Server",
		version: "0.0.1-next.3"
	};

	console.log(`🌩️ ${serverInfo.name} v${serverInfo.version}`);

	const rootPackageFolder = findRootPackageFolder();
	await initialiseLocales(rootPackageFolder);

	const { coreConfig, serverConfig, envVars, stateFilename } = await configure(rootPackageFolder);

	const engineCore = new EngineCore<IWorkbenchState>({
		config: coreConfig,
		stateStorage: new FileStateStorage(stateFilename),
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
