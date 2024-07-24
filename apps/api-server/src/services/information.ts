// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import type { IServerInfo } from "@gtsc/api-models";
import { InformationService } from "@gtsc/api-service";
import { I18n } from "@gtsc/core";
import { type IService, ServiceFactory } from "@gtsc/services";
import type { IOptions } from "../models/IOptions.js";
import { systemLogInfo } from "../progress.js";

/**
 * Initialise the information service.
 * @param options The options for the web server.
 * @param services The services.
 * @param serverInfo The server information.
 */
export function initialiseInformationService(
	options: IOptions,
	services: IService[],
	serverInfo: IServerInfo
): void {
	systemLogInfo(I18n.formatMessage("apiServer.configuring", { element: "Information Service" }));

	const specFile = path.resolve(
		path.join(options.rootPackageFolder, "docs", "open-api", "spec.json")
	);

	const informationService = new InformationService(serverInfo, specFile);
	services.push(informationService);
	ServiceFactory.register("information", () => informationService);
}
