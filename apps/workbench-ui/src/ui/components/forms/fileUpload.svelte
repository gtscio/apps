<script lang="ts">
	import { Fileupload } from 'flowbite-svelte';
	export let value: string | undefined;
	export let files: FileList | undefined;
</script>

<Fileupload
	{...$$props}
	class={`focus:ring-primary-100 focus:border-primary-500 dark:focus:ring-primary-900 border-neutral-300 bg-white outline-none focus:ring-4 ${$$props.class ?? ''} `}
	bind:value
	bind:files
></Fileupload>
