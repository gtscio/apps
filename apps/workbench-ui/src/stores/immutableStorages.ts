// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import { EntityStorageClient } from "@twin.org/entity-storage-rest-client";
import type { IUserImmutableStorageEntry } from "$models/IUserImmutableStorageEntry";

let userImmutableStorageEntryClient: EntityStorageClient<IUserImmutableStorageEntry> | undefined;

/**
 * Initialise the immutable storage.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	userImmutableStorageEntryClient = new EntityStorageClient<IUserImmutableStorageEntry>({
		endpoint: apiUrl,
		pathPrefix: "user-immutable"
	});
}

/**
 * Get a list of the immutable storage data.
 * @param cursor The cursor to use for pagination.
 * @returns The list of immutable data stored.
 */
export async function immutableStorageEntryList(cursor?: string): Promise<
	| {
			error?: string;
			items?: IUserImmutableStorageEntry[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(userImmutableStorageEntryClient)) {
		try {
			const result = await userImmutableStorageEntryClient.query(
				undefined,
				undefined,
				undefined,
				undefined,
				cursor
			);
			return {
				items: result.entities as IUserImmutableStorageEntry[],
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
export async function immutableStoragesEntrySet(entry: IUserImmutableStorageEntry): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userImmutableStorageEntryClient)) {
		try {
			await userImmutableStorageEntryClient.set(entry);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Remove an entry from the list of immutable storage.
 * @param entryId The id of entry to remove.
 * @returns The nothing unless there was an error.
 */
export async function immutableStorageEntryRemove(entryId: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(userImmutableStorageEntryClient)) {
		try {
			await userImmutableStorageEntryClient.remove(entryId);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
