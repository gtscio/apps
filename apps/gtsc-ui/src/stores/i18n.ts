// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { I18n, type ILocale, type ILocaleDictionary, type ILocalesIndex } from "@gtsc/core";
import { derived, get, writable, type Writable } from "svelte/store";
import { persistent } from "../utils/persistent";
import { dev } from "$app/environment";

let svelteFetch: typeof window.fetch | undefined;

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
 * Hook the original set so that we can load the translation before updating the value.
 */
const originalSet = currentLocale.set;
currentLocale.set = async (value: string): Promise<void> => {
	try {
		originalSet(value);
		await loadTranslation(value);
		I18n.setLocale(value);
	} catch {}
};

/**
 * Load the locales.
 * @param fetchMethod The fetch method to use.
 */
export async function init(fetchMethod: typeof window.fetch): Promise<void> {
	svelteFetch = fetchMethod;
	const response = await svelteFetch("/locales.json");

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

/**
 * Load a translation for a locale.
 * @param locale The locale to load.
 */
async function loadTranslation(locale: string): Promise<void> {
	if (svelteFetch) {
		let loadLocale = locale;
		if (locale.startsWith("debug-")) {
			loadLocale = I18n.DEFAULT_LOCALE;
		}

		const tl = get(localeDictionaries);
		if (!tl[loadLocale]) {
			const response = await svelteFetch(`/locales/${loadLocale}.json`);
			const json: ILocaleDictionary = await response.json();

			I18n.addDictionary(loadLocale, json);
		}
	}
}

I18n.addLocaleHandler("store", (locale: string) => {
	originalSet(locale);
});

I18n.addDictionaryHandler("store", () => {
	localeDictionaries.set(I18n.getAllDictionaries());
});

/**
 * Format the message.
 */
export const i18n = derived([currentLocale, localeDictionaries], () => I18n.formatMessage);
