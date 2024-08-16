<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Span } from 'flowbite-svelte';
	export let className: string | undefined;
	export { className as class };
</script>

<Span class={`whitespace-pre-wrap break-all text-gray-500 dark:text-white ${className}`}
	><slot></slot></Span
>
