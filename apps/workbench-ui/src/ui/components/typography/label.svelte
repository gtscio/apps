<script lang="ts">
	import { Label } from 'flowbite-svelte';
</script>

<Label {...$$props} class={`text-sm font-medium ${$$props.class ?? ''}`}>
	<slot></slot>
</Label>
