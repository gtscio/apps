// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HealthStatus } from "@twin.org/api-models";
import { InformationClient } from "@twin.org/api-rest-client";
import { Is } from "@twin.org/core";
import { get, writable } from "svelte/store";

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
let healthInterval: NodeJS.Timeout | undefined;

/**
 * Initialise the API information.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	informationClient = new InformationClient({
		endpoint: apiUrl
	});

	await getHealth();

	if (Is.empty(healthInterval)) {
		healthInterval = setInterval(getHealth, 30000);
	}
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
		} catch {}
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

			if (
				(result.status !== HealthStatus.Error && !Is.stringValue(get(serverVersion))) ||
				!Is.stringValue(get(serverName))
			) {
				await getInfo();
			}
		} catch {
			serverHealthStatus.set(HealthStatus.Error);
		}
	}
}
