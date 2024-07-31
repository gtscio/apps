// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { checkAuth } from "../../stores/authentication";

/**
 * Perform a load server side.
 * @param params The parameters for the load.
 * @param params.url The url to redirect to on successful authentication.
 */
export function load(params: { url: URL }): void {
	checkAuth(params.url);
}
