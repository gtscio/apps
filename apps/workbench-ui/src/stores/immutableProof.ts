// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import type { IImmutableProof } from "@twin.org/immutable-proof-models";
import { ImmutableProofClient } from "@twin.org/immutable-proof-rest-client";

let immutableProofClient: ImmutableProofClient | undefined;

/**
 * Initialise the immutable proof.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	immutableProofClient = new ImmutableProofClient({
		endpoint: apiUrl
	});
}

/**
 * Get an immutable proof.
 * @param proofId The id of the immutable proof.
 * @returns The immutable proof or an error if one occurred.
 */
export async function immutableProofGet(proofId: string): Promise<
	| {
			error?: string;
			item?: IImmutableProof;
	  }
	| undefined
> {
	if (Is.object(immutableProofClient)) {
		try {
			const result = await immutableProofClient.get(proofId);
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
