<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import '../app.css';
	import AppFooter from '$components/appFooter.svelte';
	import AppHeader from '$components/appHeader.svelte';
	import AppSidebar from '$components/appSidebar.svelte';
</script>

<div class="flex h-screen flex-col overflow-hidden">
	<AppHeader />
	<div class="mt-16 flex h-full w-full overflow-hidden sm:mt-20">
		<div
			class="dark:bg-cosmic-indigo flex h-full w-16 flex-col place-content-between overflow-y-auto bg-neutral-50 md:w-64"
		>
			<AppSidebar />
		</div>
		<div class="dark:bg-cosmic-indigo flex h-full flex-1 flex-col overflow-auto bg-white p-6">
			<slot></slot>
		</div>
	</div>
	<AppFooter />
</div>
