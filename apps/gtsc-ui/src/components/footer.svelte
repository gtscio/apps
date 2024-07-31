<script lang="ts">
	import { Footer, FooterCopyright, FooterLinkGroup, FooterLink, Select } from 'flowbite-svelte';
	import { i18n, locales, currentLocale } from '../stores/i18n';
	import { DarkMode } from 'flowbite-svelte';
</script>

<Footer class="border-t border-gray-100 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
	<div class="flex flex-row flex-wrap items-center justify-between gap-x-5">
		<FooterCopyright
			href="/"
			by={$i18n('footer.copyrightOrg')}
			year={new Date().getFullYear()}
			copyrightMessage=""
		/>
		<div class="flex flex-row items-center gap-2">
			<div class="text-sm text-gray-500 dark:text-gray-400">Language</div>
			<Select
				class="w-48"
				placeholder={$i18n('footer.selectLanguage')}
				items={$locales.map(locale => ({
					value: locale.code,
					name: locale.label
				}))}
				bind:value={$currentLocale}
			></Select>
		</div>
		<div class="flex flex-row items-center gap-2">
			<div class="text-sm text-gray-500 dark:text-gray-400">Color Scheme</div>
			<DarkMode
				btnClass="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xl p-2"
			/>
		</div>
		<FooterLinkGroup
			ulClass="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0"
		>
			<FooterLink href="/privacy">{$i18n('navigation.privacyPolicy')}</FooterLink>
		</FooterLinkGroup>
	</div>
</Footer>
