<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, ObjectHelper } from '@twin.org/core';
	import { isAuthenticated } from '$stores/authentication';
	import { i18n } from '$stores/i18n';
	import { privateProfile } from '$stores/identityProfile';
	import { Avatar, Link, Navbar, NavBrand, Span } from '$ui/components';
	import '../app.css';

	let finalInitials: string = '';

	privateProfile.subscribe(value => {
		const initials: string[] = [];

		const givenName = ObjectHelper.propertyGet(value, 'givenName');
		if (Is.stringValue(givenName)) {
			initials.push(givenName[0].toUpperCase());
		}

		const familyName = ObjectHelper.propertyGet(value, 'familyName');
		if (Is.stringValue(familyName)) {
			initials.push(familyName[0].toUpperCase());
		}

		if (initials.length === 0) {
			const email = ObjectHelper.propertyGet(value, 'email');
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
	class=" dark:bg-cosmic-indigo-600 fixed start-0 top-0 z-20 h-16 w-full min-w-72 border-b border-neutral-200 px-5 py-3 sm:h-20 dark:border-neutral-900"
>
	<NavBrand href="/" class="p-2">
		<img src="/images/logo-primary.svg" class="me-3 h-6 sm:h-9" alt={$i18n('app.name')} />
		<Span
			class="font-hdcoltonwidesemibold self-center whitespace-nowrap text-xl font-semibold dark:text-white"
			>{$i18n('app.name')}</Span
		>
	</NavBrand>
	{#if $isAuthenticated}
		<Link href="/secure/identity-profile" class="rounded-full"
			><Avatar class="cursor-pointer">{finalInitials}</Avatar></Link
		>
	{/if}
</Navbar>
