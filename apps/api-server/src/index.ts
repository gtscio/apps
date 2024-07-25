// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServerInfo } from "@gtsc/api-models";
import { CLIDisplay } from "@gtsc/cli-core";
import { BaseError, GeneralError, I18n, Is } from "@gtsc/core";
import type { IService, IServiceRequestContext } from "@gtsc/services";
import { configure } from "./configure.js";
import { initialiseLocales } from "./locales.js";
import { buildProcessors } from "./processors.js";
import { systemLogError, systemLogInfo, systemLogInit } from "./progress.js";
import { buildRoutes } from "./routes.js";
import { startWebServer } from "./server.js";
import {
	initialiseBlobStorageConnectorFactory,
	initialiseBlobStorageService
} from "./services/blobStorage.js";
import {
	initialiseIdentityConnectorFactory,
	initialiseIdentityService
} from "./services/identity.js";
import { initialiseInformationService } from "./services/information.js";
import { initialiseLoggingConnector } from "./services/logging.js";
import { initialiseNftConnectorFactory, initialiseNftService } from "./services/nft.js";
import { initialiseVaultConnectorFactory } from "./services/vault.js";

try {
	const serverInfo: IServerInfo = {
		name: "GTSC API Server",
		version: "0.0.1-next.1"
	};

	CLIDisplay.header(serverInfo.name, serverInfo.version, "🌩️ ");

	const options = configure();

	await initialiseLocales(options.rootPackageFolder);

	if (!Is.stringValue(options.systemIdentity)) {
		throw new GeneralError("apiServer", "missingSystemIdentity");
	}

	if (options.bootstrap) {
		CLIDisplay.task(I18n.formatMessage("apiServer.bootstrapMode"));
		CLIDisplay.break();
	} else if (options.debug) {
		CLIDisplay.value(I18n.formatMessage("apiServer.debuggingEnabled"), "true");
		CLIDisplay.break();
	}

	const services: IService[] = [];
	initialiseLoggingConnector(options, services);
	systemLogInit(options);

	initialiseInformationService(options, services, serverInfo);

	initialiseVaultConnectorFactory(options, services);

	initialiseIdentityConnectorFactory(options, services);
	initialiseIdentityService(options, services);

	initialiseBlobStorageConnectorFactory(options, services);
	initialiseBlobStorageService(options, services);

	initialiseNftConnectorFactory(options, services);
	initialiseNftService(options, services);

	const processors = buildProcessors(options, services);

	const systemRequestContext: IServiceRequestContext = {
		partitionId: options.systemPartitionId,
		identity: options.systemIdentity
	};

	if (options.bootstrap) {
		for (const service of services) {
			if (Is.function(service.bootstrap)) {
				systemLogInfo(
					I18n.formatMessage("apiServer.bootstrapping", { element: service.CLASS_NAME })
				);
				await service.bootstrap(systemRequestContext, options.systemLoggingConnectorName);
			}
		}

		CLIDisplay.break();
		CLIDisplay.done();
	} else {
		for (const service of services) {
			if (Is.function(service.start)) {
				systemLogInfo(I18n.formatMessage("apiServer.starting", { element: service.CLASS_NAME }));
				await service.start(systemRequestContext, options.systemLoggingConnectorName);
			}
		}

		await startWebServer(options, processors, buildRoutes(), async () => {
			for (const service of services) {
				if (Is.function(service.stop)) {
					systemLogInfo(I18n.formatMessage("apiServer.stopping", { element: service.CLASS_NAME }));
					await service.stop(systemRequestContext, options.systemLoggingConnectorName);
				}
			}
		});
	}
} catch (err) {
	systemLogError(BaseError.fromError(err));
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(1);
}
