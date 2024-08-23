<script lang="ts">
	import { Fileupload } from 'flowbite-svelte';
</script>

<Fileupload {...$$props} class={`border-neutral-300 bg-white ${$$props.class ?? ''}`}></Fileupload>
