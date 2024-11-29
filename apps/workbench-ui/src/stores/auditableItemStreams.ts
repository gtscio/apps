// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAuditableItemStream } from "@twin.org/auditable-item-stream-models";
import { AuditableItemStreamClient } from "@twin.org/auditable-item-stream-rest-client";
import { ErrorHelper, Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";

let auditableItemStreamClient: AuditableItemStreamClient | undefined;

/**
 * Initialize the auditable item streams.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	auditableItemStreamClient = new AuditableItemStreamClient({
		endpoint: apiUrl,
		pathPrefix: "ais"
	});
}

/**
 * Create an auditable items stream.
 * @param streamObject Object for the stream stored as a json ld document.
 * @param entries The entries to store.
 * @returns The id of the auditable item stream or an error if one occurred.
 */
export async function auditableItemStreamCreate(
	streamObject: IJsonLdNodeObject,
	entries?: IJsonLdNodeObject[]
): Promise<
	| {
			error?: string;
			id?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			const id = await auditableItemStreamClient.create(
				streamObject,
				entries?.map(entry => ({ entryObject: entry }))
			);
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
 * Update an auditable items stream.
 * @param id The id of the stream to update.
 * @param streamObject Object for the stream stored as a json ld document.
 * @returns The id of the auditable item stream or an error if one occurred.
 */
export async function auditableItemStreamUpdate(
	id: string,
	streamObject: IJsonLdNodeObject
): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			await auditableItemStreamClient.update(id, streamObject);
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get a list of the auditable item streams.
 * @param cursor The cursor to use for pagination.
 * @returns The list of auditable item streams.
 */
export async function auditableItemStreamList(cursor?: string): Promise<
	| {
			error?: string;
			items?: IAuditableItemStream[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			const result = await auditableItemStreamClient.query(
				undefined,
				undefined,
				undefined,
				undefined,
				cursor
			);
			return {
				items: result.streams,
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
 * Remove an auditable item stream.
 * @param id The id of stream to remove.
 * @returns The nothing unless there was an error.
 */
export async function auditableItemStreamRemove(id: string): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			await auditableItemStreamClient.remove(id);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Get an auditable item stream.
 * @param id The id of stream to get.
 * @returns The nothing unless there was an error.
 */
export async function auditableItemStreamGet(id: string): Promise<
	| {
			error?: string;
			item?: IAuditableItemStream;
	  }
	| undefined
> {
	if (Is.object(auditableItemStreamClient)) {
		try {
			const result = await auditableItemStreamClient.get(id, { verifyStream: true });
			return {
				item: result
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
