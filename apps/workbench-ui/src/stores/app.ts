// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { StringHelper } from "@gtsc/core";

export let publicBaseUrl = "";
export let privateBaseUrl = "";

/**
 * Initialize the app.
 * @param envPublicBaseUrl The base url to use for generating publicly accessible links.
 * @param envPrivateBaseUrl The base url to use for generating privately accessible links.
 */
export async function init(envPublicBaseUrl: string, envPrivateBaseUrl: string): Promise<void> {
	publicBaseUrl = StringHelper.trimTrailingSlashes(envPublicBaseUrl);
	privateBaseUrl = StringHelper.trimTrailingSlashes(envPrivateBaseUrl);
}

/**
 * Create a public URL.
 * @param resourcePath The resource path.
 * @returns The combined public url base and resource path.
 */
export function createPublicUrl(resourcePath: string): string {
	return `${publicBaseUrl}/${StringHelper.trimLeadingSlashes(resourcePath)}`;
}

/**
 * Create a private URL.
 * @param resourcePath The resource path.
 * @returns The combined private url base and resource path.
 */
export function createPrivateUrl(resourcePath: string): string {
	return `${privateBaseUrl}/${StringHelper.trimLeadingSlashes(resourcePath)}`;
}
