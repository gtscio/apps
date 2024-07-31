<script lang="ts">
	import { page } from '$app/stores';
	import { Navbar, NavBrand, NavHamburger, NavLi, NavUl } from 'flowbite-svelte';
	import '../app.css';
	import { i18n } from '../stores/i18n';
	$: activeUrl = $page.url.pathname;
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
</Navbar>
