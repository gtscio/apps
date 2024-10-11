// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property, SortDirection } from "@twin.org/entity";

/**
 * Class representing information for attestation.
 */
@entity()
export class UserAttestationEntry {
	/**
	 * The id for the attestation.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The description for the attestation.
	 */
	@property({ type: "string" })
	public description?: string;

	/**
	 * The date it was created.
	 */
	@property({ type: "string", format: "date-time", sortDirection: SortDirection.Descending })
	public dateCreated?: string;

	/**
	 * The node identity it was created with.
	 */
	@property({ type: "string" })
	public nodeIdentity?: string;

	/**
	 * The user identity who created it.
	 */
	@property({ type: "string" })
	public userIdentity?: string;
}
