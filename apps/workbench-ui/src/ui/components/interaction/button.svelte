<script lang="ts">
	import { Button } from 'flowbite-svelte';
</script>

<Button
	{...$$props}
	class={`bg-primary-500 hover:bg-primary-600 focus:ring-primary-100 focus:border-primary-500 dark:focus:ring-primary-900 focus:ring-4 ${$$props.class ?? ''}`}
	on:click
>
	<slot />
</Button>
