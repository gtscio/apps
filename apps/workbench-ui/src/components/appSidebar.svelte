<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import {
		LockOpenSolid,
		LockSolid,
		ShieldCheckSolid,
		SwatchbookSolid
	} from 'flowbite-svelte-icons';
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from './design-system';
	import { isAuthenticated } from '../stores/authentication';
	import { i18n } from '../stores/i18n';
	$: activeUrl = $page.url.pathname;
</script>

<Sidebar {activeUrl} class="h-full" asideClass="w-16 md:w-64">
	<SidebarWrapper class="dark:bg-cosmic-indigo h-full">
		<SidebarGroup>
			{#if $isAuthenticated}
				<SidebarItem label={$i18n('navigation.dashboard')} href="/secure/dashboard">
					<svelte:fragment slot="icon">
						<SwatchbookSolid
							class="h-6 w-6 text-neutral-500 transition duration-75 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-500"
						/>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem label={$i18n('navigation.attestation')} href="/secure/attestation">
					<svelte:fragment slot="icon">
						<ShieldCheckSolid
							class="h-6 w-6 text-neutral-500 transition duration-75 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-500"
						/>
					</svelte:fragment>
				</SidebarItem>
				<!--
				<SidebarItem label={$i18n('navigation.telemetry')} href="/secure/telemetry" >
					<svelte:fragment slot="icon">
						<SwatchbookSolid
							class="h-6 w-6 text-neutral-500 transition duration-75 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-500"
						/>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem label={$i18n('navigation.logging')} href="/secure/logging" >
					<svelte:fragment slot="icon">
						<RectangleListSolid
							class="h-6 w-6 text-neutral-500 transition duration-75 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-500"
						/>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem label={$i18n('navigation.nft')} href="/secure/nft" >
					<svelte:fragment slot="icon">
						<ImageSolid
							class="h-6 w-6 text-neutral-500 transition duration-75 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-500"
						/>
					</svelte:fragment>
				</SidebarItem> -->
				<SidebarGroup border>
					<SidebarItem label={$i18n('navigation.logout')} href="/authentication/logout">
						<svelte:fragment slot="icon">
							<LockOpenSolid
								class="h-6 w-6 text-neutral-500 transition duration-75 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-500"
							/>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			{/if}
			{#if !$isAuthenticated}
				<SidebarGroup>
					<SidebarItem label={$i18n('navigation.login')} href="/">
						<svelte:fragment slot="icon">
							<LockSolid
								class="h-6 w-6 text-neutral-500 transition duration-75 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-500"
							/>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			{/if}
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
