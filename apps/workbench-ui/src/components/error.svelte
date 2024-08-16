<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is } from '@gtsc/core';
	import { Helper } from 'flowbite-svelte';

	export let error: string | undefined;
</script>

{#if Is.stringValue(error)}
	<Helper color="red" class="whitespace-pre-line">
		{error}
	</Helper>
{/if}
