<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Spinner } from '@twin.org/ui-components-svelte';
	import Login from '$components/authentication/login.svelte';
	import { authenticationState } from '$stores/authentication';

	authenticationState.subscribe(value => {
		if (value === 'authenticated') {
			// This will get triggered on a successful login
			goto($page.url.searchParams.get('returnUrl') ?? '/secure/dashboard');
		}
	});
</script>

{#if $authenticationState === 'initializing'}
	<Spinner />
{:else if $authenticationState === 'not-authenticated'}
	<Login />
{/if}
