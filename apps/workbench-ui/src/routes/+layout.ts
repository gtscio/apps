// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { env } from "$env/dynamic/public";
import { Coerce, ErrorHelper, Guards } from "@gtsc/core";
import { init as initApp } from "../stores/app";
import { init as initAuthentication } from "../stores/authentication";
import { init as initBlobStorage } from "../stores/blobStorage";
import { init as initLocales } from "../stores/i18n";
import { init as initIdentity } from "../stores/identity";
import { init as initApiInformation } from "../stores/information";
import { init as initIdentityProfile } from "../stores/profile";

/**
 * Perform a load.
 */
export async function load(): Promise<void> {
	try {
		Guards.stringValue("init", "PUBLIC_WORKBENCH_API_URL", env.PUBLIC_WORKBENCH_API_URL);
		Guards.stringValue(
			"init",
			"PUBLIC_WORKBENCH_PUBLIC_BASE_URL",
			env.PUBLIC_WORKBENCH_PUBLIC_BASE_URL
		);
		Guards.stringValue(
			"init",
			"PUBLIC_WORKBENCH_PRIVATE_BASE_URL",
			env.PUBLIC_WORKBENCH_PRIVATE_BASE_URL
		);

		await initApp(env.PUBLIC_WORKBENCH_PUBLIC_BASE_URL, env.PUBLIC_WORKBENCH_PRIVATE_BASE_URL);
		await initLocales(Coerce.boolean(env.PUBLIC_WORKBENCH_DEBUG_LANGUAGES) ?? false);
		await initApiInformation(env.PUBLIC_WORKBENCH_API_URL);
		await initAuthentication(env.PUBLIC_WORKBENCH_API_URL);
		await initIdentityProfile(env.PUBLIC_WORKBENCH_API_URL);
		await initIdentity(env.PUBLIC_WORKBENCH_API_URL);
		await initBlobStorage(env.PUBLIC_WORKBENCH_API_URL);
	} catch (err) {
		// Nothing else is initialized yet so we need to console log manually
		// eslint-disable-next-line no-console
		console.error("Error during initialization", ErrorHelper.formatErrors(err).join("\n"));
	}
}
