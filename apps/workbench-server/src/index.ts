// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServerInfo } from "@gtsc/api-models";
import { CLIDisplay } from "@gtsc/cli-core";
import { BaseError, I18n, Is } from "@gtsc/core";
import type { IService } from "@gtsc/services";
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
	initialiseIdentityProfileConnectorFactory,
	initialiseIdentityProfileService,
	initialiseIdentityService
} from "./services/identity.js";
import { initialiseInformationService } from "./services/information.js";
import {
	initialiseLoggingConnectorFactory,
	initialiseLoggingService,
	initialiseNodeLoggingConnector,
	nodeLogError,
	nodeLogInfo
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
		name: "Workbench Server",
		version: "0.0.1-next.1"
	};

	CLIDisplay.header(serverInfo.name, serverInfo.version, "🌩️ ");

	const rootPackageFolder = findRootPackageFolder();
	await initialiseLocales(rootPackageFolder);

	const context = await configure(rootPackageFolder);

	if (context.debug) {
		CLIDisplay.value(I18n.formatMessage("workbench.debuggingEnabled"), "true");
		CLIDisplay.break();
	}

	const services: IService[] = [];
	initialiseNodeLoggingConnector(context, services);

	initialiseInformationService(context, services, serverInfo);

	initialiseVaultConnectorFactory(context, services);

	initialiseWalletStorage(context, services);
	initialiseFaucetConnectorFactory(context, services);
	initialiseWalletConnectorFactory(context, services);

	initialiseIdentityConnectorFactory(context, services);
	initialiseIdentityService(context, services);

	initialiseIdentityProfileConnectorFactory(context, services);
	initialiseIdentityProfileService(context, services);

	initialiseLoggingConnectorFactory(context, services);
	initialiseLoggingService(context, services);

	initialiseTelemetryConnectorFactory(context, services);
	initialiseTelemetryService(context, services);

	initialiseBlobStorageConnectorFactory(context, services);
	initialiseBlobStorageService(context, services);

	initialiseNftConnectorFactory(context, services);
	initialiseNftService(context, services);

	initialiseAttestationConnectorFactory(context, services);
	initialiseAttestationService(context, services);

	const processors = buildProcessors(context, services);

	if (context.bootstrap) {
		await bootstrap(context, services);
	}

	for (const service of services) {
		if (Is.function(service.start)) {
			nodeLogInfo(I18n.formatMessage("workbench.starting", { element: service.CLASS_NAME }));
			await service.start(context.config.nodeIdentity, context.nodeLoggingConnectorName);
		}
	}

	await startWebServer(context, processors, buildRoutes(), async () => {
		for (const service of services) {
			if (Is.function(service.stop)) {
				nodeLogInfo(I18n.formatMessage("workbench.stopping", { element: service.CLASS_NAME }));
				await service.stop(context.config.nodeIdentity, context.nodeLoggingConnectorName);
			}
		}
	});
} catch (err) {
	nodeLogError(BaseError.fromError(err));
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(1);
}
