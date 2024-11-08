// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	EntityStorageBackgroundTaskConnector,
	initSchema,
	type BackgroundTask
} from "@twin.org/background-task-connector-entity-storage";
import {
	BackgroundTaskConnectorFactory,
	type IBackgroundTaskConnector
} from "@twin.org/background-task-models";
import { GeneralError, I18n } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

/**
 * Initialise the background task connector factory.
 * @param context The context for the node.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseBackgroundTaskConnectorFactory(context: IWorkbenchContext): void {
	nodeLogInfo(
		I18n.formatMessage("workbench.configuring", { element: "Background Task Connector Factory" })
	);

	const type = context.envVars.WORKBENCH_BACKGROUND_TASK_CONNECTOR;

	let connector: IBackgroundTaskConnector;
	let namespace: string;

	if (type === "entity-storage") {
		initSchema();
		initialiseEntityStorageConnector(
			context,
			context.envVars.WORKBENCH_BACKGROUND_TASK_ENTITY_STORAGE_TYPE,
			nameof<BackgroundTask>()
		);
		connector = new EntityStorageBackgroundTaskConnector();
		namespace = EntityStorageBackgroundTaskConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "backgroundTaskConnector"
		});
	}

	context.componentInstances.push({ instanceName: namespace, component: connector });
	BackgroundTaskConnectorFactory.register(namespace, () => connector);
}
