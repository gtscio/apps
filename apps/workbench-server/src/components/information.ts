// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import type { IServerInfo } from "@twin.org/api-models";
import { InformationService } from "@twin.org/api-service";
import { ComponentFactory, I18n } from "@twin.org/core";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const INFORMATION_SERVICE_NAME = "information";

/**
 * Initialise the information service.
 * @param context The context for the node.
 * @param serverInfo The server information.
 */
export function initialiseInformationService(
	context: IWorkbenchContext,
	serverInfo: IServerInfo
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Information Service" }));

	const specFile = path.resolve(
		path.join(context.rootPackageFolder, "docs", "open-api", "spec.json")
	);

	const service = new InformationService(serverInfo, specFile);
	context.componentInstances.push({ instanceName: INFORMATION_SERVICE_NAME, component: service });
	ComponentFactory.register(INFORMATION_SERVICE_NAME, () => service);
}
