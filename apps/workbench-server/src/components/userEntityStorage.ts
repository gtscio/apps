// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ComponentFactory, I18n, StringHelper } from "@twin.org/core";
import { EntitySchemaFactory, EntitySchemaHelper } from "@twin.org/entity";
import { EntityStorageService } from "@twin.org/entity-storage-service";
import { nameof } from "@twin.org/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import { UserAttestationEntry } from "../entities/userAttestationEntry.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const APP_USER_ATTESTATION_ENTRY_STORAGE_SERVICE = "app-user-attestation-entry-storage";

/**
 * Initialise the user entity storage services.
 * @param context The context for the node.
 */
export function initialiseUserEntityStorage(context: IWorkbenchContext): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "App User Entity Storage" }));

	EntitySchemaFactory.register(nameof<UserAttestationEntry>(), () =>
		EntitySchemaHelper.getSchema(UserAttestationEntry)
	);

	initialiseEntityStorageConnector(
		context,
		context.envVars.WORKBENCH_APP_ATTESTATION_INFO_ENTITY_STORAGE_TYPE,
		nameof<UserAttestationEntry>()
	);

	const attestationInfoEntityStorageService = new EntityStorageService<UserAttestationEntry>({
		entityStorageType: StringHelper.kebabCase(nameof<UserAttestationEntry>()),
		config: {
			includeNodeIdentity: true,
			includeUserIdentity: true
		}
	});
	context.componentInstances.push({
		instanceName: APP_USER_ATTESTATION_ENTRY_STORAGE_SERVICE,
		component: attestationInfoEntityStorageService
	});
	ComponentFactory.register(
		APP_USER_ATTESTATION_ENTRY_STORAGE_SERVICE,
		() => attestationInfoEntityStorageService
	);
}
