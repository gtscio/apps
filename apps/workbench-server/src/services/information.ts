// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import type { IServerInfo } from "@gtsc/api-models";
import { InformationService } from "@gtsc/api-service";
import { I18n } from "@gtsc/core";
import { ServiceFactory, type IService } from "@gtsc/services";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const INFORMATION_SERVICE_NAME = "information";

/**
 * Initialise the information service.
 * @param context The context for the node.
 * @param services The services.
 * @param serverInfo The server information.
 */
export function initialiseInformationService(
	context: IWorkbenchContext,
	services: IService[],
	serverInfo: IServerInfo
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Information Service" }));

	const specFile = path.resolve(
		path.join(context.rootPackageFolder, "docs", "open-api", "spec.json")
	);

	const informationService = new InformationService(serverInfo, specFile);
	services.push(informationService);
	ServiceFactory.register(INFORMATION_SERVICE_NAME, () => informationService);
}
