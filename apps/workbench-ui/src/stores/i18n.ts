// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { dev } from "$app/environment";
import { I18n, Is, type ILocale, type ILocaleDictionary, type ILocalesIndex } from "@gtsc/core";
import { derived, get, writable, type Writable } from "svelte/store";
import { persistent } from "../utils/persistent";

let baseUrl: URL | undefined;

/**
 * The locales dictionaries for each code.
 */
export const localeDictionaries: Writable<{ [code: string]: { [key: string]: string } }> = writable(
	{}
);

/**
 * The complete list of locales.
 */
export const locales: Writable<ILocale[]> = writable<ILocale[]>([
	{
		label: "English",
		code: "en"
	}
]);

/**
 * The current locale.
 */
export const currentLocale: Writable<string> = persistent<string>("locale", I18n.DEFAULT_LOCALE);

/**
 * Load the locales.
 * @param url The current URL to use in loading locales.
 */
export async function init(url: URL): Promise<void> {
	baseUrl = url;
	const response = await fetch(`${baseUrl.origin}/locales.json`);

	const localesIndex: ILocalesIndex = await response.json();

	locales.update(() => {
		const loadedLocales = localesIndex.locales;

		if (dev) {
			loadedLocales.push(
				{
					label: "Debug - Keys",
					code: "debug-k"
				},
				{
					label: "Debug - Xxx",
					code: "debug-x"
				}
			);
		}

		return loadedLocales;
	});

	await loadTranslation(get(currentLocale));
}

currentLocale.subscribe(async locale => {
	await loadTranslation(locale);
	I18n.setLocale(locale);
});

/**
 * Load a translation for a locale.
 * @param locale The locale to load.
 */
async function loadTranslation(locale: string): Promise<void> {
	if (Is.notEmpty(baseUrl)) {
		let loadLocale = locale;
		if (locale.startsWith("debug-")) {
			loadLocale = I18n.DEFAULT_LOCALE;
		}

		const tl = get(localeDictionaries);
		if (!tl[loadLocale]) {
			const response = await fetch(`${baseUrl?.origin}/locales/${loadLocale}.json`);
			const json: ILocaleDictionary = await response.json();

			I18n.addDictionary(loadLocale, json);
		}
	}
}

I18n.addDictionaryHandler("store", () => {
	localeDictionaries.set(I18n.getAllDictionaries());
});

/**
 * Format the message.
 */
export const i18n = derived([currentLocale, localeDictionaries], () => I18n.formatMessage);
