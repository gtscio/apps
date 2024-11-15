// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The workbench environment variables.
 */
export interface IWorkbenchEnvironmentVariables {
	/**
	 * The user name for the node admin.
	 */
	adminUsername: string;

	/**
	 * Is blob encryption enabled.
	 */
	enableBlobEncryption: boolean;

	/**
	 * The key name for blob encryption.
	 */
	blobEncryptionKey: string;

	/**
	 * The key name for authentication signing.
	 */
	authSigningKey: string;

	/**
	 * The assertion method id for attestation.
	 */
	attestationAssertionMethodId: string;

	/**
	 * The key for the hashing in immutable proofs.
	 */
	immutableProofHashKey: string;

	/**
	 * The assertion method id for immutable proof.
	 */
	immutableProofAssertionMethodId: string;

	/**
	 * The IOTA explorer url.
	 */
	iotaExploreUrl: string;
}
