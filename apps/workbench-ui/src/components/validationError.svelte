<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, type IValidationFailure } from '@gtsc/core';
	import { Helper } from 'flowbite-svelte';
	import { i18n } from '../stores/i18n';

	export let validationErrors: IValidationFailure[] | undefined;
</script>

{#if Is.arrayValue(validationErrors)}
	<Helper class="mt-2" color="red">
		{#each validationErrors as validationError}
			{$i18n(`error.${validationError.reason}`, validationError.properties)}
		{/each}
	</Helper>
{/if}
