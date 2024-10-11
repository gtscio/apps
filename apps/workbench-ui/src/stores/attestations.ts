// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import { EntityStorageClient } from "@twin.org/entity-storage-rest-client";
import type { IUserAttestationEntry } from "$models/IUserAttestationEntry";

let attestationsClient: EntityStorageClient<IUserAttestationEntry> | undefined;

/**
 * Initialize the attestations.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	attestationsClient = new EntityStorageClient<IUserAttestationEntry>({
		endpoint: apiUrl,
		pathPrefix: "user-attestation"
	});
}

/**
 * Get a list of the attestations.
 * @param cursor The cursor to use for pagination.
 * @returns The list of attestations.
 */
export async function attestationsList(cursor?: string): Promise<
	| {
			error?: string;
			entities?: IUserAttestationEntry[];
			cursor?: string;
	  }
	| undefined
> {
	if (Is.object(attestationsClient)) {
		try {
			const result = await attestationsClient.query(undefined, undefined, undefined, cursor);
			return {
				entities: result.entities as IUserAttestationEntry[],
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
 * Add an entry to the list of the attestations.
 * @param entry The entry to add.
 * @returns The nothing unless there was an error.
 */
export async function attestationsAdd(entry: IUserAttestationEntry): Promise<
	| {
			error?: string;
	  }
	| undefined
> {
	if (Is.object(attestationsClient)) {
		try {
			await attestationsClient.set(entry);
			return {};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
