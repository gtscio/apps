<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { logout } from '$stores/authentication';

	onMount(async () => {
		await logout();
		goto('/');
	});
</script>
