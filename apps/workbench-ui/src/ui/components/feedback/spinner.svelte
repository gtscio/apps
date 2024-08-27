<script lang="ts">
	import { Spinner } from 'flowbite-svelte';
</script>

<Spinner size={7} {...$$props} class={`${$$props.class ?? ''}`} color="primary" />
