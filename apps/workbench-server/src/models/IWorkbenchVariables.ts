// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEngineEnvironmentVariables } from "@twin.org/engine";
import type { IEngineServerEnvironmentVariables } from "@twin.org/engine-server";

/**
 * The environment variables for the workbench node.
 */
export interface IWorkbenchVariables
	extends IEngineEnvironmentVariables,
		IEngineServerEnvironmentVariables {
	/**
	 * The name of the admin user.
	 */
	adminUsername?: string;
}
