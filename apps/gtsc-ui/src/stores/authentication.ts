// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageAuthenticationClient } from "@gtsc/api-auth-entity-storage-rest-client";
import { ErrorHelper, Is } from "@gtsc/core";
import { redirect } from "@sveltejs/kit";
import { get, writable } from "svelte/store";

export const authenticationToken = writable<string>("");
export const authenticationError = writable<string>("");

let authenticationClient: EntityStorageAuthenticationClient | undefined;

/**
 * Initialize the API information.
 * @param apiUrl The API url.
 * @param apiKey The API key.
 */
export async function init(apiUrl: string, apiKey: string): Promise<void> {
	authenticationClient = new EntityStorageAuthenticationClient({
		endpoint: apiUrl,
		headers: {
			"X-API-Key": apiKey
		}
	});
}

/**
 * Check for authentication token.
 * @param url The url to redirect to on successful authentication.
 */
export function checkAuth(url: URL): void {
	const authToken = get(authenticationToken);
	if (!Is.stringValue(authToken)) {
		redirect(307, `/authentication/login?returnUrl=${url.pathname}`);
	}
}

/**
 * Login the user.
 * @param emailAddress The email address.
 * @param password The password.
 */
export async function login(emailAddress: string, password: string): Promise<void> {
	if (Is.object(authenticationClient)) {
		try {
			const result = await authenticationClient.login(emailAddress, password);
			authenticationToken.set(result);
		} catch (err) {
			authenticationError.set(ErrorHelper.formatErrors(err).join("\n"));
		}
	}
}
