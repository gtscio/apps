// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRoute } from "@gtsc/api-models";
import { generateRestRoutesInformation } from "@gtsc/api-service";
import {
	generateRestRoutesIdentity,
	generateRestRoutesIdentityProfile
} from "@gtsc/identity-service";

/**
 * The routes for the application.
 * @returns The routes for the application.
 */
export function buildRoutes(): IRestRoute[] {
	return [
		...generateRestRoutesInformation("", "information"),
		...generateRestRoutesIdentity("identity", "identity"),
		...generateRestRoutesIdentityProfile("identity/profile", "identity-profile")
	];
}
