// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServerInfo } from "@gtsc/api-core";
import { CLIDisplay } from "@gtsc/cli-core";
import { I18n } from "@gtsc/core";
import { configure } from "./configure.js";
import { initialiseLocales } from "./locales.js";
import { buildRoutes } from "./routes.js";
import { startWebServer } from "./server.js";
import { initialiseInformationService, initialiseLoggingConnector } from "./services.js";

try {
	const serverInfo: IServerInfo = {
		name: "GTSC API Server",
		version: "0.0.1-next.1"
	};

	const options = configure();

	await initialiseLocales(options.rootPackageFolder);
	initialiseLoggingConnector();
	initialiseInformationService(serverInfo, options.rootPackageFolder);

	CLIDisplay.header(serverInfo.name, serverInfo.version, "🌩️ ");
	if (options.debug) {
		CLIDisplay.value(I18n.formatMessage("apiServer.debuggingEnabled"), "true");
		CLIDisplay.break();
	}

	await startWebServer(options, buildRoutes());
} catch (err) {
	CLIDisplay.error(err);
}
