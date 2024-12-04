// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseError, ErrorHelper, Is, NotFoundError, ObjectHelper } from "@twin.org/core";
import { IdentityProfileClient } from "@twin.org/identity-rest-client";
import type { Person, WithContext } from "schema-dts";
import { get, writable } from "svelte/store";
import { authenticationState } from "./authentication";

export const profileIdentity = writable<string>("");
export const publicProfile = writable<WithContext<Person> | undefined>();
export const privateProfile = writable<WithContext<Person> | undefined>();

let identityProfileClient: IdentityProfileClient | undefined;

/**
 * Initialise the identity profile.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	identityProfileClient = new IdentityProfileClient({
		endpoint: apiUrl
	});

	authenticationState.subscribe(async value => {
		if (value === "authenticated") {
			await profileGet();
		} else {
			profileIdentity.set("");
			publicProfile.set(undefined);
			privateProfile.set(undefined);
		}
	});
}

/**
 * Get the profile details.
 */
async function profileGet(): Promise<void> {
	profileIdentity.set("");
	publicProfile.set(undefined);
	privateProfile.set(undefined);

	if (Is.object(identityProfileClient)) {
		try {
			const profile = await identityProfileClient.get();

			profileIdentity.set(profile.identity);
			publicProfile.set(profile.publicProfile as WithContext<Person>);
			privateProfile.set(profile.privateProfile as WithContext<Person>);
		} catch (err) {
			const error = BaseError.fromError(err);
			if (BaseError.isErrorName(error, NotFoundError.CLASS_NAME)) {
				publicProfile.set(undefined);
				privateProfile.set(undefined);
			}
		}
	}
}

/**
 * Update the profile.
 * @param updatedPublicProfile The updated public profile.
 * @param updatedPublicProfile.name The updated name.
 * @param updatedPrivateProfile The updated private profile.
 * @param updatedPrivateProfile.givenName The updated given name.
 * @param updatedPrivateProfile.familyName The updated family name.
 * @returns The error if one occurred.
 */
export async function profileUpdate(
	updatedPublicProfile: { name: string },
	updatedPrivateProfile: { givenName: string; familyName: string }
): Promise<string | undefined> {
	if (Is.object(identityProfileClient)) {
		try {
			const publicProf = get(publicProfile);
			ObjectHelper.propertySet(publicProf, "name", updatedPublicProfile.name);

			const privateProf = get(privateProfile);
			ObjectHelper.propertySet(privateProf, "givenName", updatedPrivateProfile.givenName);
			ObjectHelper.propertySet(privateProf, "familyName", updatedPrivateProfile.familyName);

			await identityProfileClient.update(publicProf, privateProf);
		} catch (err) {
			return ErrorHelper.formatErrors(err).join("\n");
		}
	}
}

/**
 * Get the public profile for the identity.
 * @param identity The identity to get the profile for.
 * @returns The error if one occurred.
 */
export async function profileGetPublic(identity: string): Promise<
	| {
			profile?: WithContext<Person>;
			error?: string | undefined;
	  }
	| undefined
> {
	if (Is.object(identityProfileClient)) {
		try {
			const profile = await identityProfileClient.getPublic(identity);

			return {
				profile: profile as WithContext<Person>
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
