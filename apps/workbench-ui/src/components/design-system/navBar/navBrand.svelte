<script lang="ts">
	import { NavBrand } from 'flowbite-svelte';
</script>

<NavBrand
	{...$$props}
	class={`focus:ring-primary-100 focus:border-primary-500 rounded outline-none focus:ring-4 ${$$props.class ?? ''}`}
>
	<slot></slot>
</NavBrand>
