<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, ObjectHelper } from '@twin.org/core';
	import {
		AppFooter,
		AppHeader,
		AppSidebar,
		type ISideBarGroup
	} from '@twin.org/ui-components-svelte';
	import {
		LockOpenSolid,
		LockSolid,
		ShieldCheckSolid,
		SwatchbookSolid
	} from 'flowbite-svelte-icons';
	import ServerStatus from '$components/serverStatus.svelte';
	import { isAuthenticated } from '$stores/authentication';
	import { privateProfile } from '$stores/identityProfile';
	import '../app.css';

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
						label: 'navigation.attestation',
						icon: ShieldCheckSolid,
						route: '/secure/attestation'
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

<div class="flex h-screen flex-col overflow-hidden">
	<AppHeader
		isAuthenticated={showAuthBadge}
		initials={finalInitials}
		profileNavRoute="/secure/identity-profile"
	/>
	<div class="mt-16 flex h-full w-full overflow-hidden sm:mt-20">
		<div
			class="dark:bg-cosmic-indigo flex h-full w-16 flex-col place-content-between overflow-y-auto bg-neutral-50 md:w-64"
		>
			<AppSidebar groups={sidebarGroups} />
		</div>
		<div class="dark:bg-cosmic-indigo flex h-full flex-1 flex-col overflow-auto bg-white p-6">
			<slot></slot>
		</div>
	</div>
	<AppFooter>
		<ServerStatus slot="start" />
	</AppFooter>
</div>
