<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, ObjectHelper } from '@twin.org/core';
	import { AppLayout, type ISideBarGroup } from '@twin.org/ui-components-svelte';
	import {
		FileSolid,
		LockOpenSolid,
		LockSolid,
		ShieldCheckSolid,
		SwatchbookSolid
	} from 'flowbite-svelte-icons';
	import { isAuthenticated } from '$stores/authentication';
	import { privateProfile } from '$stores/identityProfile';
	import '../app.css';
	import { serverHealthStatus, serverName, serverVersion } from '$stores/information';

	let sidebarGroups: ISideBarGroup[] = [];
	let showAuthBadge = false;
	let finalInitials: string = '';

	$: {
		sidebarGroups = [];

		if ($isAuthenticated) {
			sidebarGroups.push({
				items: [
					{
						label: 'navigation.dashboard',
						icon: SwatchbookSolid,
						route: '/secure/dashboard'
					},
					{
						label: 'navigation.blobs',
						icon: FileSolid,
						route: '/secure/blobs'
					},
					{
						label: 'navigation.attestations',
						icon: ShieldCheckSolid,
						route: '/secure/attestations'
					},
					{
						label: 'navigation.logout',
						icon: LockOpenSolid,
						route: '/authentication/logout'
					}
				]
			});
		} else {
			sidebarGroups.push({
				items: [
					{
						label: 'navigation.login',
						icon: LockSolid,
						route: '/'
					}
				]
			});
		}

		showAuthBadge = $isAuthenticated ?? false;
	}

	$: {
		const initials: string[] = [];

		const givenName = ObjectHelper.propertyGet($privateProfile, 'givenName');
		if (Is.stringValue(givenName)) {
			initials.push(givenName[0].toUpperCase());
		}

		const familyName = ObjectHelper.propertyGet($privateProfile, 'familyName');
		if (Is.stringValue(familyName)) {
			initials.push(familyName[0].toUpperCase());
		}

		if (initials.length === 0) {
			const email = ObjectHelper.propertyGet($privateProfile, 'email');
			if (Is.stringValue(email)) {
				initials.push(email[0]);
			}
		}

		finalInitials = initials.join('');
	}
</script>

<AppLayout
	{sidebarGroups}
	isAuthenticated={showAuthBadge}
	initials={finalInitials}
	profileNavRoute="/secure/identity-profile"
	serverHealthStatus={$serverHealthStatus}
	serverName={$serverName}
	serverVersion={$serverVersion}
>
	<slot></slot>
</AppLayout>
