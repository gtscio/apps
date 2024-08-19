<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { DarkMode, Footer, Select } from 'flowbite-svelte';
	import ServerStatus from './serverStatus.svelte';
	import { currentLocale, i18n, locales } from '../stores/i18n';
</script>

<Footer class="border-t border-gray-100 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
	<div class="flex flex-col items-center justify-between gap-2 md:flex-row">
		<ServerStatus />
		<div class="flex flex-row flex-wrap items-center gap-2">
			<div class="text-sm text-gray-500 dark:text-gray-400">{$i18n('footer.language')}</div>
			<Select
				class="w-48"
				size="sm"
				name="language"
				placeholder={$i18n('footer.selectLanguage')}
				items={$locales.map(locale => ({
					value: locale.code,
					name: locale.label
				}))}
				bind:value={$currentLocale}
			></Select>
		</div>
		<div class="flex flex-row items-center gap-2">
			<div class="text-sm text-gray-500 dark:text-gray-400">{$i18n('footer.colorTheme')}</div>
			<DarkMode
				btnClass="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xl p-2"
			/>
		</div>
	</div>
</Footer>
