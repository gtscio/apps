// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { PUBLIC_WORKBENCH_SERVER_URL } from "$env/static/public";
import { init as initApiInformation } from "../stores/apiInformation";
import { init as initAuthentication } from "../stores/authentication";
import { init as initLocales } from "../stores/i18n";
import { init as initIdentityProfile } from "../stores/profile";

/**
 * Perform a load.
 * @param params The parameters for the load.
 * @param params.fetch The fetch method to use.
 */
export async function load(params: { fetch: typeof window.fetch }): Promise<void> {
	try {
		await initLocales(params.fetch);
		await initApiInformation(PUBLIC_WORKBENCH_SERVER_URL);
		await initAuthentication(PUBLIC_WORKBENCH_SERVER_URL);
		await initIdentityProfile(PUBLIC_WORKBENCH_SERVER_URL);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Error during init load", err);
	}
}
