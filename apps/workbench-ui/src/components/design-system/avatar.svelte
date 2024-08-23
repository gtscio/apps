<script lang="ts">
	import { Avatar } from 'flowbite-svelte';
</script>

<Avatar border {...$$props} class={`${$$props.class ?? ''}`}>
	<slot></slot>
</Avatar>
