// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageAuthenticationClient } from "@gtsc/api-auth-entity-storage-rest-client";
import { ErrorHelper, Is } from "@gtsc/core";
import { redirect } from "@sveltejs/kit";
import { get, writable } from "svelte/store";
import { persistent } from "../utils/persistent";

export const isAuthenticated = writable<boolean | undefined>();
export const authenticationError = writable<string>("");
const authenticationExpiry = persistent<number>("auth-expiry", 0);

let authenticationClient: EntityStorageAuthenticationClient | undefined;
let intervalId: number | undefined;

/**
 * Initialize the API information.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	authenticationClient = new EntityStorageAuthenticationClient({
		endpoint: apiUrl
	});

	// The application has just started, if we have reached the expiry time
	// then we are no longer authenticated, so set store to logged out status.
	const expiry = get(authenticationExpiry);
	if (expiry > 0) {
		if (expiry < Date.now()) {
			setAsLoggedOut();
		} else {
			await refresh();
		}
	} else {
		setAsLoggedOut();
	}

	isAuthenticated.subscribe(async value => {
		if (value) {
			// We are authenticated, start the token refresh.
			await startTokenRefresh();
		} else {
			// No longer authenticated, stop the token refresh.
			stopTokenRefresh();
		}
	});
}

/**
 * Check for authentication token.
 * @param url The url to redirect to on successful authentication.
 */
export function checkAuth(url: URL): void {
	const authenticated = get(isAuthenticated);
	if (!authenticated) {
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
			// Authentication token is set in cookie, so no token is returned
			// from the login method, just capture the expiry time
			const result = await authenticationClient.login(emailAddress, password);
			authenticationExpiry.set(result.expiry);
			isAuthenticated.set(true);
		} catch (err) {
			authenticationError.set(ErrorHelper.formatErrors(err).join("\n"));
			setAsLoggedOut();
		}
	}
}

/**
 * Logout the user.
 */
export async function logout(): Promise<void> {
	if (Is.object(authenticationClient)) {
		try {
			// Authentication token is set in cookie, sending the
			// logout request will clear the cookie
			await authenticationClient.logout();
		} catch {}

		setAsLoggedOut();
	}
}

/**
 * Refresh the auth token.
 */
export async function refresh(): Promise<void> {
	if (Is.object(authenticationClient)) {
		try {
			// Authentication token is set in cookie, we should
			// intermittently refresh the token to keep the session alive
			const result = await authenticationClient.refresh();
			authenticationExpiry.set(result.expiry);
			isAuthenticated.set(true);
		} catch {
			setAsLoggedOut();
		}
	}
}

/**
 * Set the user as logged out.
 */
function setAsLoggedOut(): void {
	isAuthenticated.set(false);
	authenticationExpiry.set(0);
}

/**
 * Start checking the auth token has expired.
 */
async function startTokenRefresh(): Promise<void> {
	stopTokenRefresh();

	// Every 5 minutes refresh the token.
	intervalId = window.setInterval(async () => refresh(), 5 * 60 * 1000);
}

/**
 * Stop checking the auth token has expired.
 */
function stopTokenRefresh(): void {
	if (intervalId) {
		window.clearInterval(intervalId);
		intervalId = undefined;
	}
}
