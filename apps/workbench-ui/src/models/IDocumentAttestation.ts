// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/**
 * Model representing data stored in document attestation.
 */
export interface IDocumentAttestation {
	/**
	 * The id of the item in blob storage.
	 */
	blobId: string;

	/**
	 * The signature of the item.
	 */
	signature: string;
}
