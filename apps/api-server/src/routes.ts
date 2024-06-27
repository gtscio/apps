// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { generateRestRoutes } from "@gtsc/api-core";
import type { IRestRoute } from "@gtsc/api-models";

/**
 * The routes for the application.
 * @returns The routes for the application.
 */
export function buildRoutes(): IRestRoute[] {
	return [...generateRestRoutes("", "information")];
}
