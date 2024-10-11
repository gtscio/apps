// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Interface representing information for attestation.
 */
export interface IUserAttestationEntry {
	/**
	 * The id for the attestation.
	 */
	id: string;

	/**
	 * The description for the attestation.
	 */
	description: string;

	/**
	 * The date it was created.
	 */
	dateCreated: string;
}
