// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { env } from "$env/dynamic/public";
import { Coerce, ErrorHelper, Guards } from "@gtsc/core";
import { init as initApp } from "../stores/app";

/**
 * Perform a load and initialize the application.
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

		await initApp({
			apiUrl: env.PUBLIC_WORKBENCH_API_URL,
			envPublicBaseUrl: env.PUBLIC_WORKBENCH_PUBLIC_BASE_URL,
			envPrivateBaseUrl: env.PUBLIC_WORKBENCH_PRIVATE_BASE_URL,
			debugLanguages: Coerce.boolean(env.PUBLIC_WORKBENCH_DEBUG_LANGUAGES) ?? false
		});
	} catch (err) {
		// Nothing else is initialized yet so we need to console log manually
		// eslint-disable-next-line no-console
		console.error("Error during initialization", ErrorHelper.formatErrors(err).join("\n"));
	}
}
