// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { InformationService, type IServerInfo } from "@gtsc/api-core";
import { ConsoleLoggingConnector } from "@gtsc/logging-connector-console";
import { LoggingConnectorFactory } from "@gtsc/logging-models";
import { ServiceFactory } from "@gtsc/services";

/**
 * Initialises the information service.
 * @param serverInfo The server information.
 * @param rootPackageFolder The root package folder.
 */
export function initialiseInformationService(
	serverInfo: IServerInfo,
	rootPackageFolder: string
): void {
	const specFile = path.resolve(path.join(rootPackageFolder, "docs", "open-api", "spec.json"));

	const informationService = new InformationService(serverInfo, specFile);
	ServiceFactory.register("information", () => informationService);
}

/**
 * Initialises the logging connector.
 */
export function initialiseLoggingConnector(): void {
	const loggingConnector = new ConsoleLoggingConnector({
		translateMessages: true,
		hideGroups: true
	});
	LoggingConnectorFactory.register("logging", () => loggingConnector);
}
