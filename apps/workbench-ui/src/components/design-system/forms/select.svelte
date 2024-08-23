<script lang="ts">
	import { Select } from 'flowbite-svelte';
	export let value: unknown;
</script>

<Select
	{...$$props}
	class={`focus:ring-primary-100 focus:border-primary-500 border-neutral-300 bg-white focus:ring-4 ${$$props.class ?? ''}`}
	on:change
	bind:value
>
	<slot />
</Select>
