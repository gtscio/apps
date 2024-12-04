// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationInformation } from "@twin.org/attestation-models";
import { AttestationClient } from "@twin.org/attestation-rest-client";
import { ErrorHelper, Is } from "@twin.org/core";
import type { IDocumentAttestation } from "$models/IDocumentAttestation";

let attestationClient: AttestationClient | undefined;

/**
 * Initialise the attestation.
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
 * @param attestationObject The data to attest.
 * @returns The attestation information or an error if one occurred.
 */
export async function attestationCreate(
	assertionMethod: string,
	attestationObject: IDocumentAttestation
): Promise<
	| {
			error?: string;
			attestationId?: string;
	  }
	| undefined
> {
	if (Is.object(attestationClient)) {
		try {
			const attestationId = await attestationClient.create(assertionMethod, attestationObject);
			return {
				attestationId
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
export async function attestationGet(attestationId: string): Promise<
	| {
			error?: string;
			item?: IAttestationInformation;
	  }
	| undefined
> {
	if (Is.object(attestationClient)) {
		try {
			const result = await attestationClient.get(attestationId);
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
