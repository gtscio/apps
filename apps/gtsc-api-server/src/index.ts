// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServerInfo } from "@gtsc/api-models";
import { CLIDisplay } from "@gtsc/cli-core";
import { BaseError, I18n, Is } from "@gtsc/core";
import type { IService, IServiceRequestContext } from "@gtsc/services";
import { bootstrap } from "./bootstrap.js";
import { configure, findRootPackageFolder } from "./configure.js";
import { initialiseLocales } from "./locales.js";
import { buildRoutes } from "./routes.js";
import { startWebServer } from "./server.js";
import {
	initialiseAttestationConnectorFactory,
	initialiseAttestationService
} from "./services/attestation.js";
import {
	initialiseBlobStorageConnectorFactory,
	initialiseBlobStorageService
} from "./services/blobStorage.js";
import { initialiseFaucetConnectorFactory } from "./services/faucet.js";
import {
	initialiseIdentityConnectorFactory,
	initialiseIdentityService
} from "./services/identity.js";
import { initialiseInformationService } from "./services/information.js";
import {
	initialiseLoggingConnectorFactory,
	initialiseLoggingService,
	initialiseSystemLoggingConnector,
	systemLogError,
	systemLogInfo
} from "./services/logging.js";
import { initialiseNftConnectorFactory, initialiseNftService } from "./services/nft.js";
import { buildProcessors } from "./services/processors.js";
import {
	initialiseTelemetryConnectorFactory,
	initialiseTelemetryService
} from "./services/telemetry.js";
import { initialiseVaultConnectorFactory } from "./services/vault.js";
import { initialiseWalletConnectorFactory, initialiseWalletStorage } from "./services/wallet.js";

try {
	const serverInfo: IServerInfo = {
		name: "GTSC API Server",
		version: "0.0.1-next.1"
	};

	CLIDisplay.header(serverInfo.name, serverInfo.version, "🌩️ ");

	const rootPackageFolder = findRootPackageFolder();
	await initialiseLocales(rootPackageFolder);

	const options = await configure(rootPackageFolder);

	if (options.bootstrap) {
		CLIDisplay.task(I18n.formatMessage("apiServer.bootstrapMode"));
		CLIDisplay.break();
	} else if (options.debug) {
		CLIDisplay.value(I18n.formatMessage("apiServer.debuggingEnabled"), "true");
		CLIDisplay.break();
	}

	const services: IService[] = [];
	initialiseSystemLoggingConnector(options, services);

	initialiseInformationService(options, services, serverInfo);

	initialiseVaultConnectorFactory(options, services);

	initialiseIdentityConnectorFactory(options, services);
	initialiseIdentityService(options, services);

	initialiseLoggingConnectorFactory(options, services);
	initialiseLoggingService(options, services);

	initialiseTelemetryConnectorFactory(options, services);
	initialiseTelemetryService(options, services);

	initialiseBlobStorageConnectorFactory(options, services);
	initialiseBlobStorageService(options, services);

	initialiseNftConnectorFactory(options, services);
	initialiseNftService(options, services);

	initialiseAttestationConnectorFactory(options, services);
	initialiseAttestationService(options, services);

	initialiseWalletStorage(options, services);
	initialiseFaucetConnectorFactory(options, services);
	initialiseWalletConnectorFactory(options, services);

	const processors = buildProcessors(options, services);

	if (options.bootstrap) {
		await bootstrap(options, services);

		CLIDisplay.break();
		CLIDisplay.done();
	} else {
		const systemRequestContext: IServiceRequestContext = {
			partitionId: options.systemConfig.systemPartitionId,
			systemIdentity: options.systemConfig.systemIdentity
		};

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
