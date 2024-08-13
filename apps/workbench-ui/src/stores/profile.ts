// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseError, ErrorHelper, Is, NotFoundError } from "@gtsc/core";
import type { IIdentityProfileProperty } from "@gtsc/identity-models";
import { IdentityProfileClient } from "@gtsc/identity-rest-client";
import { PropertyHelper } from "@gtsc/schema";
import { get, writable } from "svelte/store";
import { isAuthenticated } from "./authentication";

export const profileProperties = writable<IIdentityProfileProperty[]>([]);

let identityProfileClient: IdentityProfileClient | undefined;

/**
 * Initialize the identity profile.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	identityProfileClient = new IdentityProfileClient({
		endpoint: apiUrl,
		pathPrefix: "identity/profile"
	});

	isAuthenticated.subscribe(async value => {
		if (value) {
			await profileRefresh();
		} else {
			profileProperties.set([]);
		}
	});
}

/**
 * Refresh the profile details.
 */
async function profileRefresh(): Promise<void> {
	profileProperties.set([]);

	if (Is.object(identityProfileClient)) {
		try {
			const profile = await identityProfileClient.get();

			const properties = profile.properties ?? [];

			profileProperties.set(properties);
		} catch (err) {
			const error = BaseError.fromError(err);
			if (BaseError.isErrorName(error, NotFoundError.CLASS_NAME)) {
				profileProperties.set([]);
			}
		}
	}
}

/**
 * Update the profile.
 * @param firstName The profile first name.
 * @param lastName The profile last name.
 * @returns The error if one occurred.
 */
export async function profileUpdate(
	firstName: string,
	lastName: string
): Promise<string | undefined> {
	if (Is.object(identityProfileClient)) {
		try {
			const properties = get(profileProperties);
			PropertyHelper.setText(properties, "firstName", firstName);
			PropertyHelper.setText(properties, "lastName", lastName);
			profileProperties.set(properties);

			await identityProfileClient.update(properties);
		} catch (err) {
			return ErrorHelper.formatErrors(err).join("\n");
		}
	}
}
