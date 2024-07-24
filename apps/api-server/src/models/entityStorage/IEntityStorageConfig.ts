// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { EntityStorageTypes } from "./entityStorageTypes";

/**
 * The entity storage configuration.
 */
export interface IEntityStorageConfig {
	/**
	 * The type of the entity storage connector.
	 */
	type: EntityStorageTypes;

	/**
	 * The name of the entity storage.
	 */
	storageName: string;

	/**
	 * The name of the schema to use for the entity.
	 */
	schema: string;
}
