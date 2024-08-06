<script lang="ts">
	import { Is } from '@gtsc/core';
	import { Helper } from 'flowbite-svelte';
	import { i18n } from '../stores/i18n';

	export let property: string;
	export let validationErrors: { [id: string]: string };
</script>

{#if Is.stringValue(validationErrors[property])}
	<Helper class="mt-2" color="red">
		{$i18n(`error.${validationErrors[property]}`)}
	</Helper>
{/if}
