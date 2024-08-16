// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationInformation } from "@gtsc/attestation-models";
import { AttestationClient } from "@gtsc/attestation-rest-client";
import { ErrorHelper, Is } from "@gtsc/core";
import type { IDocumentAttestation } from "../models/IDocumentAttestation";

let attestationClient: AttestationClient | undefined;

/**
 * Initialize the attestation.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	attestationClient = new AttestationClient({
		endpoint: apiUrl
	});
}

/**
 * Attest some data.
 * @param assertionMethod The assertion method to use.
 * @param data The data to attest.
 * @returns The id of the attestation or an error if one occurred.
 */
export async function attestationAttest(
	assertionMethod: string,
	data: IDocumentAttestation
): Promise<
	| {
			error?: string;
			info?: IAttestationInformation<IDocumentAttestation>;
	  }
	| undefined
> {
	if (Is.object(attestationClient)) {
		try {
			const info = await attestationClient.attest(assertionMethod, data);
			return {
				info
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
