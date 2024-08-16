<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is } from '@gtsc/core';
	import { PropertyHelper } from '@gtsc/schema';
	import { Avatar, Navbar, NavBrand, Span } from 'flowbite-svelte';
	import '../app.css';
	import { isAuthenticated } from '../stores/authentication';
	import { i18n } from '../stores/i18n';
	import { profileProperties } from '../stores/identityProfile';

	let finalInitials: string = '';

	profileProperties.subscribe(value => {
		const initials: string[] = [];

		const firstName = PropertyHelper.getText(value, 'firstName');
		if (Is.stringValue(firstName)) {
			initials.push(firstName[0].toUpperCase());
		}
		const lastName = PropertyHelper.getText(value, 'lastName');
		if (Is.stringValue(lastName)) {
			initials.push(lastName[0].toUpperCase());
		}
		if (initials.length === 0) {
			const email = PropertyHelper.getText(value, 'email');
			if (Is.stringValue(email)) {
				initials.push(email[0]);
			}
		}

		finalInitials = initials.join('');
	});
</script>

<svelte:head>
	<title>{$i18n('app.name')}</title>
</svelte:head>

<Navbar
	fluid={true}
	class="fixed start-0 top-0 z-20 h-16 w-full min-w-72 border-b px-5 py-3 sm:h-20"
>
	<NavBrand href="/">
		<img src="/images/logo.svg" class="me-3 h-6 sm:h-9" alt={$i18n('app.name')} />
		<Span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
			>{$i18n('app.name')}</Span
		>
	</NavBrand>
	{#if $isAuthenticated}
		<a href="/secure/identity-profile"
			><Avatar border class="ring-primary-600 dark:ring-primary-600 cursor-pointer"
				>{finalInitials}</Avatar
			></a
		>
	{/if}
</Navbar>
