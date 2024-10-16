// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Interface representing information for attestation.
 */
export interface IUserAttestationEntry {
	/**
	 * The id for the entry.
	 */
	id: string;

	/**
	 * The description for the entry.
	 */
	description: string;

	/**
	 * The date it was created.
	 */
	dateCreated: string;
}
