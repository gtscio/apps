// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BlobStorageClient } from "@gtsc/blob-storage-rest-client";
import { Converter, ErrorHelper, Is } from "@gtsc/core";
import { PropertyHelper, type IProperty } from "@gtsc/schema";

let blobStorageClient: BlobStorageClient | undefined;

/**
 * Initialize the blob storage.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	blobStorageClient = new BlobStorageClient({
		endpoint: apiUrl
	});
}

/**
 * Upload a new file to blob storage.
 * @param filename The original name of the file.
 * @param mimeType The mime type of the file.
 * @param bytes The bytes to store.
 * @returns The id of the uploaded document or an error if one occurred.
 */
export async function blobStorageUpload(
	filename: string,
	mimeType: string,
	bytes: Uint8Array
): Promise<
	| {
			error?: string;
			id?: string;
	  }
	| undefined
> {
	if (Is.object(blobStorageClient)) {
		try {
			const metadata: IProperty[] = [];
			PropertyHelper.setText(metadata, "filename", filename);
			PropertyHelper.setText(metadata, "mimeType", mimeType);
			const id = await blobStorageClient.create(Converter.bytesToBase64(bytes), metadata);
			return {
				id
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get a file from blob storage.
 * @param id The if of the blob to get.
 * @param includeContent Should the content be included.
 * @returns The blob data and the properties.
 */
export async function blobStorageGet(
	id: string,
	includeContent: boolean
): Promise<
	| {
			error?: string;
			metadata?: IProperty[];
			blob?: Uint8Array;
	  }
	| undefined
> {
	if (Is.object(blobStorageClient)) {
		try {
			const result = await blobStorageClient.get(id, includeContent);
			return {
				metadata: result.metadata,
				blob: Is.stringBase64(result.blob) ? Converter.base64ToBytes(result.blob) : undefined
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Create a download link for the document.
 * @param id The id of the document.
 * @param download Should the content disposition be set to download.
 * @param filename The filename to use for the download.
 * @returns The download link.
 */
export function createDownloadLink(id: string, download: boolean, filename?: string): string {
	if (Is.object(blobStorageClient)) {
		return blobStorageClient.createDownloadLink(id, download, filename);
	}
	return "";
}
