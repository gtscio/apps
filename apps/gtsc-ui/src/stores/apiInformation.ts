// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HealthStatus } from "@gtsc/api-models";
import { InformationClient } from "@gtsc/api-rest-client";
import { Is } from "@gtsc/core";
import { writable } from "svelte/store";

export const serverVersion = writable<string>("");
export const serverName = writable<string>("");
export const serverHealthStatus = writable<HealthStatus | undefined>();
export const serverComponentHealth = writable<
	{
		name: string;
		status: HealthStatus;
		details?: string;
	}[]
>([]);

let informationClient: InformationClient | undefined;

/**
 * Initialize the API information.
 * @param apiUrl The API url.
 * @param apiKey The API key.
 */
export async function init(apiUrl: string, apiKey: string): Promise<void> {
	informationClient = new InformationClient({
		endpoint: apiUrl,
		headers: {
			"X-API-Key": apiKey
		},
		pathPrefix: ""
	});

	await getInfo();
	await getHealth();
}

/**
 * Get the information from the server.
 */
export async function getInfo(): Promise<void> {
	if (Is.object(informationClient)) {
		try {
			const result = await informationClient.info();
			serverVersion.set(result.version);
			serverName.set(result.name);
		} catch {
			serverHealthStatus.set(HealthStatus.Error);
		}
	}
}

/**
 * Get the health of the server.
 */
export async function getHealth(): Promise<void> {
	if (Is.object(informationClient)) {
		try {
			const result = await informationClient.health();
			serverHealthStatus.set(result.status);
			serverComponentHealth.set(result.components ?? []);
		} catch {}
	}
}
