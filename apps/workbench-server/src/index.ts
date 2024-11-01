// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServerInfo } from "@twin.org/api-models";
import { CLIDisplay } from "@twin.org/cli-core";
import { BaseError, I18n, Is } from "@twin.org/core";
import { bootstrap } from "./bootstrap.js";
import {
	initialiseAttestationConnectorFactory,
	initialiseAttestationService
} from "./components/attestation.js";
import { initialiseAuditableItemGraphService } from "./components/auditableItemGraph.js";
import { initialiseAuditableItemStreamService } from "./components/auditableItemStream.js";
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
import { initialiseImmutableProofService } from "./components/immutableProof.js";
import { initialiseImmutableStorageConnectorFactory } from "./components/immutableStorage.js";
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
import { initialiseUserEntityStorage } from "./components/userEntityStorage.js";
import { initialiseVaultConnectorFactory } from "./components/vault.js";
import { initialiseWalletConnectorFactory, initialiseWalletStorage } from "./components/wallet.js";
import { configure, findRootPackageFolder } from "./configure.js";
import { initialiseLocales } from "./locales.js";
import { buildRoutes } from "./routes.js";
import { startWebServer } from "./server.js";

try {
	const serverInfo: IServerInfo = {
		name: "Workbench Server",
		version: "0.0.1-next.3"
	};

	CLIDisplay.header(serverInfo.name, serverInfo.version, "🌩️ ");

	const rootPackageFolder = findRootPackageFolder();
	await initialiseLocales(rootPackageFolder);

	const context = await configure(rootPackageFolder);

	if (context.debug) {
		CLIDisplay.value(I18n.formatMessage("workbench.debuggingEnabled"), "true");
		CLIDisplay.break();
	}

	initialiseNodeLoggingConnector(context);

	initialiseInformationService(context, serverInfo);

	initialiseVaultConnectorFactory(context);

	initialiseWalletStorage(context);
	initialiseFaucetConnectorFactory(context);
	initialiseWalletConnectorFactory(context);

	initialiseIdentityConnectorFactory(context);
	initialiseIdentityService(context);

	initialiseIdentityProfileConnectorFactory(context);
	initialiseIdentityProfileService(context);

	initialiseLoggingConnectorFactory(context);
	initialiseLoggingService(context);

	initialiseTelemetryConnectorFactory(context);
	initialiseTelemetryService(context);

	initialiseBlobStorageConnectorFactory(context);
	initialiseBlobStorageService(context);

	initialiseImmutableStorageConnectorFactory(context);

	initialiseNftConnectorFactory(context);
	initialiseNftService(context);

	initialiseImmutableProofService(context);

	initialiseAttestationConnectorFactory(context);
	initialiseAttestationService(context);

	initialiseAuditableItemGraphService(context);
	initialiseAuditableItemStreamService(context);

	initialiseUserEntityStorage(context);

	const processors = buildProcessors(context);

	await bootstrap(context);

	for (const instance of context.componentInstances) {
		if (Is.function(instance.component.start)) {
			nodeLogInfo(I18n.formatMessage("workbench.starting", { element: instance.instanceName }));
			await instance.component.start(context.config.nodeIdentity, context.nodeLoggingConnectorName);
		}
	}

	await startWebServer(context, processors, buildRoutes(), async () => {
		for (const instance of context.componentInstances) {
			if (Is.function(instance.component.stop)) {
				nodeLogInfo(I18n.formatMessage("workbench.stopping", { element: instance.instanceName }));
				await instance.component.stop(
					context.config.nodeIdentity,
					context.nodeLoggingConnectorName
				);
			}
		}
	});
} catch (err) {
	nodeLogError(BaseError.fromError(err));
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(1);
}
