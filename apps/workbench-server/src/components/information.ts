// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import type { IServerInfo } from "@gtsc/api-models";
import { InformationService } from "@gtsc/api-service";
import { ComponentFactory, I18n, type IComponent } from "@gtsc/core";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const INFORMATION_SERVICE_NAME = "information";

/**
 * Initialise the information service.
 * @param context The context for the node.
 * @param components The components.
 * @param serverInfo The server information.
 */
export function initialiseInformationService(
	context: IWorkbenchContext,
	components: IComponent[],
	serverInfo: IServerInfo
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Information Service" }));

	const specFile = path.resolve(
		path.join(context.rootPackageFolder, "docs", "open-api", "spec.json")
	);

	const informationService = new InformationService(serverInfo, specFile);
	components.push(informationService);
	ComponentFactory.register(INFORMATION_SERVICE_NAME, () => informationService);
}
