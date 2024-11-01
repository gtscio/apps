// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ComponentFactory, I18n } from "@twin.org/core";
import {
	ImmutableProofService,
	initSchema as initSchemaImmutableProof,
	type ImmutableProof
} from "@twin.org/immutable-proof-service";
import { nameof } from "@twin.org/nameof";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const IMMUTABLE_PROOF_SERVICE_NAME = "immutable-proof";
export const IMMUTABLE_PROOF_HASH_KEY = "immutable-proof-hash";
export const IMMUTABLE_PROOF_ASSERTION_METHOD_ID = "immutable-proof-assertion";

/**
 * Initialise the immutable proof connector service.
 * @param context The context for the node.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseImmutableProofService(context: IWorkbenchContext): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "Immutable Proof Service" }));

	initSchemaImmutableProof();

	initialiseEntityStorageConnector(
		context,
		context.envVars.WORKBENCH_IMMUTABLE_PROOF_ENTITY_STORAGE_TYPE,
		nameof<ImmutableProof>()
	);

	const service = new ImmutableProofService({
		vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
		immutableStorageType: context.envVars.WORKBENCH_IMMUTABLE_STORAGE_CONNECTOR,
		identityConnectorType: context.envVars.WORKBENCH_IDENTITY_CONNECTOR,
		config: {
			assertionMethodId: IMMUTABLE_PROOF_ASSERTION_METHOD_ID,
			proofHashKeyId: IMMUTABLE_PROOF_HASH_KEY
		}
	});
	context.componentInstances.push({
		instanceName: IMMUTABLE_PROOF_SERVICE_NAME,
		component: service
	});
	ComponentFactory.register(IMMUTABLE_PROOF_SERVICE_NAME, () => service);
}
