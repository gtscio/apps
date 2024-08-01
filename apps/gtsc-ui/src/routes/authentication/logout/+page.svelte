<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { logout } from '../../../stores/authentication';

	onMount(async () => {
		await logout();
		goto('/');
	});
</script>
