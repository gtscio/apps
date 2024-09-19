// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationInformation } from "@twin.org/attestation-models";
import { AttestationClient } from "@twin.org/attestation-rest-client";
import { ErrorHelper, Is } from "@twin.org/core";
import type { IDocumentAttestation } from "$models/IDocumentAttestation";

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
 * @returns The attestation information or an error if one occurred.
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

/**
 * Verify an attestation data.
 * @param attestationId The id of the attestation.
 * @returns The id of the attestation or an error if one occurred.
 */
export async function attestationVerify(attestationId: string): Promise<
	| {
			error?: string;
			verified?: boolean;
			failure?: string;
			information?: Partial<IAttestationInformation<IDocumentAttestation>>;
	  }
	| undefined
> {
	if (Is.object(attestationClient)) {
		try {
			const info = await attestationClient.verify<IDocumentAttestation>(attestationId);
			return {
				verified: info.verified,
				failure: info.failure,
				information: info.information
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
