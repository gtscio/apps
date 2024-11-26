// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-console */
import { Is } from "@twin.org/core";
import { EntityStorageComponentType, type IEngineConfig } from "@twin.org/engine-types";
import { EntitySchemaFactory, EntitySchemaHelper } from "@twin.org/entity";
import { nameof } from "@twin.org/nameof";
import { UserAttestationEntry } from "./entities/userAttestationEntry.js";

/**
 * Extends the engine config with types specific to workbench.
 * @param engineConfig The engine engine configuration.
 */
export function extendEngineConfig(engineConfig: IEngineConfig): void {
	if (Is.arrayValue(engineConfig.types.attestationConnector)) {
		engineConfig.types.entityStorageComponent ??= [];

		EntitySchemaFactory.register(nameof<UserAttestationEntry>(), () =>
			EntitySchemaHelper.getSchema(UserAttestationEntry)
		);

		engineConfig.types.entityStorageComponent.push({
			type: EntityStorageComponentType.Service,
			options: {
				entityStorageType: nameof<UserAttestationEntry>(),
				config: { includeNodeIdentity: true, includeUserIdentity: true }
			},
			restPath: "user-attestation"
		});
	}
}
