<script lang="ts">
	import { Spinner } from 'flowbite-svelte';
</script>

<Spinner {...$$props} class={`${$$props.class ?? ''}`} color="primary" />
