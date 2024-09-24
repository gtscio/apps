// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";

/**
 * Model representing data stored in document attestation.
 */
export interface IDocumentAttestation extends IJsonLdNodeObject {
	/**
	 * The id of the item in blob storage.
	 */
	blobId: string;

	/**
	 * The signature of the item.
	 */
	signature: string;
}
