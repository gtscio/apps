// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import { EntityStorageClient } from "@twin.org/entity-storage-rest-client";
import type { IUserNftEntry } from "$models/IUserNftEntry";

let userNftEntryClient: EntityStorageClient<IUserNftEntry> | undefined;

/**
 * Initialise the nfts.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	userNftEntryClient = new EntityStorageClient<IUserNftEntry>({
		endpoint: apiUrl,
		pathPrefix: "user-nft"
	});
}

/**
 * Get a list of the nfts.
 * @param cursor The cursor to use for pagination.
 * @returns The list of nfts.
 */
export async function nftEntryList(cursor?: string): Promise<
	| {
			error?: string;
			items?: IUserNftEntry[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(userNftEntryClient)) {
		try {
			const result = await userNftEntryClient.query(
				undefined,
				undefined,
				undefined,
				undefined,
				cursor
			);
			return {
				items: result.entities as IUserNftEntry[],
				cursor: result.cursor
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Add an entry to the list of the nfts.
 * @param entry The entry to add.
 * @returns The nothing unless there was an error.
 */
export async function nftsEntrySet(entry: IUserNftEntry): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userNftEntryClient)) {
		try {
			await userNftEntryClient.set(entry);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove an entry to the list of the nfts.
 * @param entryId The id of entry to remove.
 * @returns The nothing unless there was an error.
 */
export async function nftsEntryRemove(entryId: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userNftEntryClient)) {
		try {
			await userNftEntryClient.remove(entryId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
