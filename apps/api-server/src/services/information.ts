// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import type { IServerInfo } from "@gtsc/api-models";
import { InformationService } from "@gtsc/api-service";
import { I18n } from "@gtsc/core";
import { type IService, ServiceFactory } from "@gtsc/services";
import { logInfo } from "../progress.js";

/**
 * Initialise the information service.
 * @param envVars The environment variables.
 * @param services The services.
 * @param serverInfo The server information.
 * @param rootPackageFolder The root package folder.
 */
export function initialiseInformationService(
	envVars: { [id: string]: string },
	services: IService[],
	serverInfo: IServerInfo,
	rootPackageFolder: string
): void {
	logInfo(I18n.formatMessage("apiServer.configuring", { element: "Information Service" }));

	const specFile = path.resolve(path.join(rootPackageFolder, "docs", "open-api", "spec.json"));

	const informationService = new InformationService(serverInfo, specFile);
	services.push(informationService);
	ServiceFactory.register("information", () => informationService);
}
