<script lang="ts">
	import { DarkMode } from 'flowbite-svelte';
</script>

<DarkMode
	border
	{...$$props}
	class={`focus:ring-primary-100 focus:border-primary-500 border focus:ring-4 focus-visible:outline-none ${$$props.class ?? ''}`}
></DarkMode>
