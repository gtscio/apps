// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Interface representing information for immutable storage.
 */
export interface IUserImmutableStorageEntry {
	/**
	 * The id for the entry.
	 */
	id: string;

	/**
	 * The description for the entry.
	 */
	description: string;

	/**
	 * The data that was created.
	 */
	data: string;

	/**
	 * The date when the data was created.
	 */
	date: string;
}
