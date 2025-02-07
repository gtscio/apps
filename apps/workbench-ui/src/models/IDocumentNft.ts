// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";

/**
 * Model representing data stored in document nft.
 */
export interface IDocumentNft extends IJsonLdNodeObject {
	/**
	 * The context of the document nft.
	 */
	"@context": "https://schema.twindev.org/workbench/";

	/**
	 * The type of the document nft.
	 */
	type: "DocumentNft";

	/**
	 * The id of the item in blob storage.
	 */
	blobId: string;

	/**
	 * The signature of the item.
	 */
	signature: string;
}
