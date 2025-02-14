// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { ImmutableStorageClient } from "@twin.org/immutable-storage-rest-client";

let immutableStorageClient: ImmutableStorageClient | undefined;

/**
 * Initialise the immutable storage.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	immutableStorageClient = new ImmutableStorageClient({
		endpoint: apiUrl
	});
}

/**
 * Upload new data to immutable storage.
 * @param data The data to store.
 * @returns The id of the uploaded document or an error if one occurred.
 */
export async function immutableStorageUpload(data: Uint8Array): Promise<
	| {
			error?: string;
			id?: string;
			receipt?: IJsonLdNodeObject;
	  }
	| undefined
> {
	if (Is.object(immutableStorageClient)) {
		try {
			const response = await immutableStorageClient.store(data);
			// eslint-disable-next-line no-console
			console.log("CLIENT", response);
			return response;
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get the data from immutable storage.
 * @param id The if of the immutable data to get.
 * @param options Options for the request.
 * @param options.includeData Should the data be included.
 * @returns The receipt and data properties.
 */
export async function immutableStorageGet(
	id: string,
	options?: { includeData: boolean }
): Promise<
	| {
			error?: string;
			data?: Uint8Array;
			receipt?: IJsonLdNodeObject;
	  }
	| undefined
> {
	if (Is.object(immutableStorageClient)) {
		try {
			const result = await immutableStorageClient.get(id, options);
			return {
				data: result.data,
				receipt: result.receipt
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove an entry to the list of the immutable storage entries.
 * @param entryId The id of entry to remove.
 * @returns The nothing unless there was an error.
 */
export async function immutableStorageRemove(entryId: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(immutableStorageClient)) {
		try {
			await immutableStorageClient.remove(entryId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
