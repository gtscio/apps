// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { init as initApiInformation } from "../stores/apiInformation";
import { init as initAuthentication } from "../stores/authentication";
import { init as initLocales } from "../stores/i18n";
import { init as initIdentityProfile } from "../stores/profile";
import { PUBLIC_GTSC_API_URL } from "$env/static/public";

/**
 * Perform a load.
 * @param params The parameters for the load.
 * @param params.fetch The fetch method to use.
 */
export async function load(params: { fetch: typeof window.fetch }): Promise<void> {
	await initLocales(params.fetch);
	await initApiInformation(PUBLIC_GTSC_API_URL);
	await initAuthentication(PUBLIC_GTSC_API_URL);
	await initIdentityProfile(PUBLIC_GTSC_API_URL);
}
