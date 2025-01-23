// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import { IdentityResolverClient } from "@twin.org/identity-rest-client";
import type { IDidDocument } from "@twin.org/standards-w3c-did";

let identityResolverClient: IdentityResolverClient | undefined;

/**
 * Initialise the identity resolver.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	identityResolverClient = new IdentityResolverClient({
		endpoint: apiUrl
	});
}

/**
 * Get the document for the identity.
 * @param identity The identity to get the document for.
 * @returns The error if one occurred.
 */
export async function identityResolve(identity: string): Promise<
	| {
			document?: IDidDocument;
			error?: string | undefined;
	  }
	| undefined
> {
	if (Is.object(identityResolverClient)) {
		try {
			const document = await identityResolverClient.identityResolve(identity);

			return {
				document
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
