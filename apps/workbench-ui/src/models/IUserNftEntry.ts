// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Interface representing information for attestation.
 */
export interface IUserNftEntry {
	/**
	 * The id for the entry.
	 */
	id: string;

	/**
	 * The nftId for the entry.
	 */
	nftId: string;

	/**
	 * The issuer it was created.
	 */
	issuer: string;

	/**
	 * The owner it was created.
	 */
	owner: string;

	/**
	 * The tag it was created.
	 */
	tag: string;
}
