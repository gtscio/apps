// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServerInfo } from "@gtsc/api-models";
import { CLIDisplay } from "@gtsc/cli-core";
import { BaseError, I18n, Is } from "@gtsc/core";
import type { IService } from "@gtsc/services";
import { configure } from "./configure.js";
import { initialiseLocales } from "./locales.js";
import { buildProcessors } from "./processors.js";
import { logError, logInfo, logInit } from "./progress.js";
import { buildRoutes } from "./routes.js";
import { startWebServer } from "./server.js";
import {
	initialiseIdentityConnectorFactory,
	initialiseIdentityService
} from "./services/identity.js";
import { initialiseInformationService } from "./services/information.js";
import { initialiseLoggingConnector } from "./services/logging.js";
import { initialiseVaultConnectorFactory } from "./services/vault.js";

try {
	const serverInfo: IServerInfo = {
		name: "GTSC API Server",
		version: "0.0.1-next.1"
	};

	CLIDisplay.header(serverInfo.name, serverInfo.version, "🌩️ ");

	const options = configure();

	await initialiseLocales(options.rootPackageFolder);

	const isBootstrap = process.argv.length > 2 && process.argv[2] === "--bootstrap";

	if (isBootstrap) {
		CLIDisplay.task(I18n.formatMessage("apiServer.bootstrapMode"));
		CLIDisplay.break();
	} else if (options.debug) {
		CLIDisplay.value(I18n.formatMessage("apiServer.debuggingEnabled"), "true");
		CLIDisplay.break();
	}

	const systemLoggingConnectorName = "system-logging";

	const services: IService[] = [];
	initialiseLoggingConnector(options.envVars, services, systemLoggingConnectorName);
	logInit(systemLoggingConnectorName, options.debug);

	initialiseInformationService(options.envVars, services, serverInfo, options.rootPackageFolder);

	initialiseVaultConnectorFactory(options.envVars, services);
	initialiseIdentityConnectorFactory(options.envVars, services);
	initialiseIdentityService(options.envVars, services);

	const processors = buildProcessors(options, services, systemLoggingConnectorName);

	if (isBootstrap) {
		for (const service of services) {
			if (Is.function(service.bootstrap)) {
				logInfo(I18n.formatMessage("apiServer.bootstrapping", { element: service.CLASS_NAME }));
				await service.bootstrap(options.systemPartitionId);
			}
		}

		CLIDisplay.break();
		CLIDisplay.done();
	} else {
		for (const service of services) {
			if (Is.function(service.start)) {
				logInfo(I18n.formatMessage("apiServer.starting", { element: service.CLASS_NAME }));
				await service.start(options.systemPartitionId);
			}
		}

		await startWebServer(
			options,
			processors,
			buildRoutes(),
			systemLoggingConnectorName,
			async () => {
				for (const service of services) {
					if (Is.function(service.stop)) {
						logInfo(I18n.formatMessage("apiServer.stopping", { element: service.CLASS_NAME }));
						await service.stop(options.systemPartitionId);
					}
				}
			}
		);
	}
} catch (err) {
	logError(BaseError.fromError(err));
}
