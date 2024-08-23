<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is } from '@gtsc/core';
	import { PropertyHelper } from '@gtsc/schema';
	import '../app.css';
	import { Avatar, Link, Navbar, NavBrand, Span } from './design-system';
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
	class="dark:bg-cosmic-indigo fixed start-0 top-0 z-20 h-16 w-full min-w-72 border-b border-neutral-200 px-5 py-3 sm:h-20 dark:border-neutral-900"
>
	<NavBrand href="/">
		<img src="/images/logo-primary.svg" class="me-3 h-6 sm:h-9" alt={$i18n('app.name')} />
		<Span
			class="font-hdcoltonwidesemibold self-center whitespace-nowrap text-xl font-semibold dark:text-white"
			>{$i18n('app.name')}</Span
		>
	</NavBrand>
	{#if $isAuthenticated}
		<Link href="/secure/identity-profile" class="rounded-full"
			><Avatar class="ring-primary-600 dark:ring-primary-600 cursor-pointer">{finalInitials}</Avatar
			></Link
		>
	{/if}
</Navbar>
