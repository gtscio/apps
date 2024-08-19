<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import '../app.css';
	import Footer from '../components/footer.svelte';
	import Header from '../components/header.svelte';
	import Sidebar from '../components/sidebar.svelte';
</script>

<div class="flex h-screen flex-col overflow-hidden">
	<Header />
	<div class="mt-16 flex h-full w-full overflow-hidden sm:mt-20">
		<div
			class="flex h-full w-16 flex-col place-content-between overflow-y-auto bg-gray-50 md:w-64 dark:bg-gray-800"
		>
			<Sidebar />
		</div>
		<div class="flex h-full flex-1 flex-col overflow-auto bg-white p-6 dark:bg-gray-900">
			<slot></slot>
		</div>
	</div>
	<Footer />
</div>
