// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-console */
import { Is } from "@twin.org/core";
import { EntityStorageComponentType, type IEngineConfig } from "@twin.org/engine-types";
import { EntitySchemaFactory, EntitySchemaHelper } from "@twin.org/entity";
import { nameof } from "@twin.org/nameof";
import { UserAttestationEntry } from "./entities/userAttestationEntry.js";
import { UserImmutableStorageEntry } from "./entities/userImmutableStorageEntry.js";
import { UserNftEntry } from "./entities/userNftEntry.js";

/**
 * Extends the engine config with types specific to workbench.
 * @param engineConfig The engine configuration.
 */
export function extendEngineConfig(engineConfig: IEngineConfig): void {
	// Add a custom entity storage type for the users attestations,
	// but only if the attestation connectors are available.
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
			overrideInstanceType: nameof<UserAttestationEntry>(),
			restPath: "user-attestation"
		});
	}

	// Add a custom entity storage type for the users nfts,
	// but only if the nft connectors are available.
	if (Is.arrayValue(engineConfig.types.nftConnector)) {
		engineConfig.types.entityStorageComponent ??= [];

		EntitySchemaFactory.register(nameof<UserNftEntry>(), () =>
			EntitySchemaHelper.getSchema(UserNftEntry)
		);

		engineConfig.types.entityStorageComponent.push({
			type: EntityStorageComponentType.Service,
			options: {
				entityStorageType: nameof<UserNftEntry>(),
				config: { includeNodeIdentity: true, includeUserIdentity: true }
			},
			overrideInstanceType: nameof<UserNftEntry>(),
			restPath: "user-nft"
		});
	}

	// Add a custom entity storage type for the users nfts,
	// but only if the nft connectors are available.
	if (Is.arrayValue(engineConfig.types.immutableStorageConnector)) {
		engineConfig.types.entityStorageComponent ??= [];

		EntitySchemaFactory.register(nameof<UserImmutableStorageEntry>(), () =>
			EntitySchemaHelper.getSchema(UserImmutableStorageEntry)
		);

		engineConfig.types.entityStorageComponent.push({
			type: EntityStorageComponentType.Service,
			options: {
				entityStorageType: nameof<UserImmutableStorageEntry>(),
				config: { includeNodeIdentity: true, includeUserIdentity: true }
			},
			overrideInstanceType: nameof<UserImmutableStorageEntry>(),
			restPath: "user-immutable"
		});
	}
}
