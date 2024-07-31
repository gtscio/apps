<script lang="ts">
	import { page } from '$app/stores';
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import {
		ImageSolid,
		LockOpenSolid,
		LockSolid,
		RectangleListSolid,
		ShieldCheckSolid,
		SwatchbookSolid
	} from 'flowbite-svelte-icons';
	import { authenticationToken } from '../stores/authentication';
	import { i18n } from '../stores/i18n';
	import { Is } from '@gtsc/core';
	$: activeUrl = $page.url.pathname;
	let activeClass =
		'flex items-center p-2 text-base font-normal text-primary-900 bg-primary-200 dark:bg-primary-700 rounded-lg dark:text-white hover:bg-primary-100 dark:hover:bg-gray-700';
	let nonActiveClass =
		'flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700';
</script>

<Sidebar {activeUrl} {activeClass} {nonActiveClass} class="h-full">
	<SidebarWrapper class="h-full">
		<SidebarGroup>
			{#if Is.stringValue($authenticationToken)}
				<SidebarItem label="Telemetry" href="/secure/telemetry">
					<svelte:fragment slot="icon">
						<SwatchbookSolid
							class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem label="Logging" href="/secure/logging">
					<svelte:fragment slot="icon">
						<RectangleListSolid
							class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem label="Attestation" href="/secure/attestation">
					<svelte:fragment slot="icon">
						<ShieldCheckSolid
							class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem label="NFT" href="/secure/nft">
					<svelte:fragment slot="icon">
						<ImageSolid
							class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem>
			{/if}
			{#if Is.stringValue($authenticationToken)}
				<SidebarGroup border>
					<SidebarItem label={$i18n('navigation.logout')} href="/authentication/logout">
						<svelte:fragment slot="icon">
							<LockOpenSolid
								class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
							/>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			{:else}
				<SidebarGroup>
					<SidebarItem label={$i18n('navigation.login')} href="/authentication/login">
						<svelte:fragment slot="icon">
							<LockSolid
								class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
							/>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			{/if}
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
