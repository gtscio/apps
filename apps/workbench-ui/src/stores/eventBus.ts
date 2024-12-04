// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import type { EventBusCallback } from "@twin.org/event-bus-models";
import { EventBusSocketClient } from "@twin.org/event-bus-socket-client";

let eventBusClient: EventBusSocketClient | undefined;

/**
 * Initialise the event bus.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	eventBusClient = new EventBusSocketClient({
		config: {
			endpoint: apiUrl
		}
	});
}

/**
 * Subscribe to a topic.
 * @param topic The topic to subscribe to.
 * @param callback The callback to call when the event occurs.
 * @returns The subscription id or an error if one occurs.
 */
export async function eventBusSubscribe<T>(
	topic: string,
	callback: EventBusCallback<T>
): Promise<
	| {
			error?: string;
			subscriptionId?: string;
	  }
	| undefined
> {
	if (Is.object(eventBusClient)) {
		try {
			const subscriptionId = await eventBusClient.subscribe(topic, callback);
			return {
				subscriptionId
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}

/**
 * Unsubscribe from a topic.
 * @param subscriptionId The subscription to remove.
 */
export async function eventBusUnsubscribe(subscriptionId: string): Promise<void> {
	if (Is.object(eventBusClient)) {
		try {
			await eventBusClient.unsubscribe(subscriptionId);
		} catch {}
	}
}
