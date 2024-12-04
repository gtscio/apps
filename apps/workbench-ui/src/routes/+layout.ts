// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { env } from "$env/dynamic/public";
import { Coerce, ErrorHelper, Guards } from "@twin.org/core";
import { init as initApp } from "../stores/app";

/**
 * Perform a load and initialise the application.
 * @param params The load params.
 * @param params.url The URL.
 */
export async function load(params: { url: URL }): Promise<void> {
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
		Guards.stringValue(
			"init",
			"PUBLIC_WORKBENCH_IOTA_EXPLORER_URL",
			env.PUBLIC_WORKBENCH_IOTA_EXPLORER_URL
		);

		await initApp({
			rootUrl: params.url,
			localesIndex: [
				{
					label: "English",
					code: "en"
				}
			],
			apiUrl: env.PUBLIC_WORKBENCH_API_URL,
			envPublicBaseUrl: env.PUBLIC_WORKBENCH_PUBLIC_BASE_URL,
			envPrivateBaseUrl: env.PUBLIC_WORKBENCH_PRIVATE_BASE_URL,
			debugLanguages: Coerce.boolean(env.PUBLIC_WORKBENCH_DEBUG_LANGUAGES) ?? false,
			iotaExplorerUrl: env.PUBLIC_WORKBENCH_IOTA_EXPLORER_URL
		});
	} catch (err) {
		// Nothing else is initialised yet so we need to console log manually
		// eslint-disable-next-line no-console
		console.error("Error during initialisation", ErrorHelper.formatErrors(err).join("\n"));
	}
}
