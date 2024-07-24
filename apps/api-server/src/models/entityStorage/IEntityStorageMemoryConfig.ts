// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEntityStorageConfig } from "./IEntityStorageConfig";

/**
 * The memory entity storage configuration.
 */
export interface IEntityStorageMemoryConfig extends IEntityStorageConfig {
	/**
	 * The type of the entity storage connector.
	 */
	type: "memory";
}
