// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { PUBLIC_WORKBENCH_SERVER_URL, PUBLIC_WORKBENCH_DEBUG_LANGUAGES } from "$env/static/public";
import { Coerce } from "@gtsc/core";
import { init as initApiInformation } from "../stores/apiInformation";
import { init as initAuthentication } from "../stores/authentication";
import { init as initLocales } from "../stores/i18n";
import { init as initIdentityProfile } from "../stores/profile";

/**
 * Perform a load.
 */
export async function load(): Promise<void> {
	try {
		await initLocales(Coerce.boolean(PUBLIC_WORKBENCH_DEBUG_LANGUAGES) ?? false);
		await initApiInformation(PUBLIC_WORKBENCH_SERVER_URL);
		await initAuthentication(PUBLIC_WORKBENCH_SERVER_URL);
		await initIdentityProfile(PUBLIC_WORKBENCH_SERVER_URL);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Error during init load", err);
	}
}
