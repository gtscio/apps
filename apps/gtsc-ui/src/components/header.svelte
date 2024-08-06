<script lang="ts">
	import { page } from '$app/stores';
	import { Avatar, Navbar, NavBrand, NavHamburger, NavLi, NavUl } from 'flowbite-svelte';
	import '../app.css';
	import { i18n } from '../stores/i18n';
	import { isAuthenticated } from '../stores/authentication';
	import { profileProperties } from '../stores/profile';
	import { PropertyHelper } from '@gtsc/schema';
	import { Is } from '@gtsc/core';

	$: activeUrl = $page.url.pathname;

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
	class="fixed start-0 top-0 z-20 h-16 w-full min-w-64 border-b px-5 py-3 sm:h-20"
>
	<NavBrand href="/">
		<img src="/images/logo.svg" class="me-3 h-6 sm:h-9" alt={$i18n('app.name')} />
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
			>{$i18n('app.name')}</span
		>
	</NavBrand>
	<NavHamburger />
	<NavUl {activeUrl}>
		<NavLi href="/">{$i18n('navigation.home')}</NavLi>
		<NavLi href="/about">{$i18n('navigation.about')}</NavLi>
	</NavUl>
	{#if $isAuthenticated}
		<a href="/secure/identity-profile"
			><Avatar border class="cursor-pointer ring-primary-600 dark:ring-primary-600"
				>{finalInitials}</Avatar
			></a
		>
	{/if}
</Navbar>
