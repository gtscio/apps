<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	$: activeUrl = $page.url.pathname;
</script>

<Navbar
	fluid={true}
	class="fixed start-0 top-0 z-20 h-16 w-full min-w-64 border-b px-5 py-3 sm:h-20"
>
	<NavBrand href="/">
		<img src="/logo.svg" class="me-3 h-6 sm:h-9" alt="GTSC" />
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">GTSC</span>
	</NavBrand>
	<NavHamburger />
	<NavUl {activeUrl}>
		<NavLi href="/">Home</NavLi>
		<NavLi href="/about">About</NavLi>
	</NavUl>
</Navbar>
