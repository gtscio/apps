// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "@gtsc/core";
import { redirect } from "@sveltejs/kit";
import { get, writable } from "svelte/store";

export const authenticationToken = writable<string>("");

/**
 * Check for authentication token.
 * @param url The url to redirect to on successful authentication.
 */
export function checkAuth(url: URL): void {
	if (!Is.stringValue(get(authenticationToken))) {
		redirect(307, `/authentication/login?returnUrl=${url.pathname}`);
	}
}
