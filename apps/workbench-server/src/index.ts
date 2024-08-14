// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServerInfo } from "@gtsc/api-models";
import { CLIDisplay } from "@gtsc/cli-core";
import { BaseError, I18n, type IComponent, Is } from "@gtsc/core";
import { bootstrap } from "./bootstrap.js";
import {
	initialiseAttestationConnectorFactory,
	initialiseAttestationService
} from "./components/attestation.js";
import {
	initialiseBlobStorageConnectorFactory,
	initialiseBlobStorageService
} from "./components/blobStorage.js";
import { initialiseFaucetConnectorFactory } from "./components/faucet.js";
import {
	initialiseIdentityConnectorFactory,
	initialiseIdentityProfileConnectorFactory,
	initialiseIdentityProfileService,
	initialiseIdentityService
} from "./components/identity.js";
import { initialiseInformationService } from "./components/information.js";
import {
	initialiseLoggingConnectorFactory,
	initialiseLoggingService,
	initialiseNodeLoggingConnector,
	nodeLogError,
	nodeLogInfo
} from "./components/logging.js";
import { initialiseNftConnectorFactory, initialiseNftService } from "./components/nft.js";
import { buildProcessors } from "./components/processors.js";
import {
	initialiseTelemetryConnectorFactory,
	initialiseTelemetryService
} from "./components/telemetry.js";
import { initialiseVaultConnectorFactory } from "./components/vault.js";
import { initialiseWalletConnectorFactory, initialiseWalletStorage } from "./components/wallet.js";
import { configure, findRootPackageFolder } from "./configure.js";
import { initialiseLocales } from "./locales.js";
import { buildRoutes } from "./routes.js";
import { startWebServer } from "./server.js";

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

	const components: IComponent[] = [];
	initialiseNodeLoggingConnector(context, components);

	initialiseInformationService(context, components, serverInfo);

	initialiseVaultConnectorFactory(context, components);

	initialiseWalletStorage(context, components);
	initialiseFaucetConnectorFactory(context, components);
	initialiseWalletConnectorFactory(context, components);

	initialiseIdentityConnectorFactory(context, components);
	initialiseIdentityService(context, components);

	initialiseIdentityProfileConnectorFactory(context, components);
	initialiseIdentityProfileService(context, components);

	initialiseLoggingConnectorFactory(context, components);
	initialiseLoggingService(context, components);

	initialiseTelemetryConnectorFactory(context, components);
	initialiseTelemetryService(context, components);

	initialiseBlobStorageConnectorFactory(context, components);
	initialiseBlobStorageService(context, components);

	initialiseNftConnectorFactory(context, components);
	initialiseNftService(context, components);

	initialiseAttestationConnectorFactory(context, components);
	initialiseAttestationService(context, components);

	const processors = buildProcessors(context, components);

	if (context.bootstrap) {
		await bootstrap(context, components);
	}

	for (const component of components) {
		if (Is.function(component.start)) {
			nodeLogInfo(I18n.formatMessage("workbench.starting", { element: component.CLASS_NAME }));
			await component.start(context.config.nodeIdentity, context.nodeLoggingConnectorName);
		}
	}

	await startWebServer(context, processors, buildRoutes(), async () => {
		for (const component of components) {
			if (Is.function(component.stop)) {
				nodeLogInfo(I18n.formatMessage("workbench.stopping", { element: component.CLASS_NAME }));
				await component.stop(context.config.nodeIdentity, context.nodeLoggingConnectorName);
			}
		}
	});
} catch (err) {
	nodeLogError(BaseError.fromError(err));
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(1);
}
