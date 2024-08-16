<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import { Is, Urn } from '@gtsc/core';
	import { PropertyHelper } from '@gtsc/schema';
	import type { IDidDocument } from '@gtsc/standards-w3c-did';
	import { Button, Card, Heading, Label, Spinner } from 'flowbite-svelte';
	import { CloudArrowUpOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import Error from '../../../../components/error.svelte';
	import LabelledValue from '../../../../components/labelledValue.svelte';
	import Qr from '../../../../components/qr.svelte';
	import { createPublicUrl } from '../../../../stores/app';
	import { i18n } from '../../../../stores/i18n';
	import { identityGetPublic } from '../../../../stores/identity';
	import { profileGetPublic } from '../../../../stores/identityProfile';
	import { createExplorerIdentityUrl } from '../../../../stores/iota';

	const identity = $page.params.identity;
	let displayName: string;
	let error: string;
	let didDocument: IDidDocument | undefined;
	let isBusy = true;
	let exploreUrl: string | undefined;

	const urn = Urn.fromValidString(identity);
	if (urn.namespaceMethod() === 'iota') {
		exploreUrl = createExplorerIdentityUrl(identity);
	}

	onMount(async () => {
		error = '';

		const resultProfile = await profileGetPublic(identity);
		if (Is.stringValue(resultProfile?.error)) {
			error = resultProfile.error;
		} else {
			displayName = PropertyHelper.getText(resultProfile?.properties, 'displayName') ?? '';
		}

		const resultIdentity = await identityGetPublic(identity);
		if (Is.stringValue(resultIdentity?.error)) {
			error += resultIdentity.error;
		} else {
			didDocument = resultIdentity?.document;
		}
		isBusy = false;
	});

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.identityPublic.title')}</Heading>
		{#if isBusy}
			<Spinner size={5} color="white" />
		{/if}
	</div>
	<Error {error} />
	{#if !isBusy}
		<div class="flex flex-row justify-between gap-5">
			<div class="flex flex-col gap-4">
				<Label>
					{$i18n('pages.identityPublic.identity')}
					<LabelledValue>{identity}</LabelledValue>
				</Label>
				{#if Is.stringValue(displayName)}
					<Label>
						{$i18n('pages.identityPublic.displayName')}
						<LabelledValue>{displayName}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(exploreUrl)}
					<Label>
						<Button size="xs" on:click={openExplorer} class="gap-2"
							>{$i18n('pages.identityPublic.explore')}<CloudArrowUpOutline size="sm" /></Button
						>
					</Label>
				{/if}
			</div>
			<Qr
				qrData={createPublicUrl(`identity/${identity}`)}
				labelResource="pages.identityPublic.qr"
				dimensions={128}
			/>
		</div>
		{#if Is.object(didDocument)}
			<Label>
				{$i18n('pages.identityPublic.didDocument')}
				<div class="mt-2 w-full rounded-md border dark:border-gray-700">
					<pre class="w-full overflow-auto p-2 text-xs">{JSON.stringify(
							didDocument,
							undefined,
							2
						)}</pre>
				</div>
			</Label>
		{/if}
	{/if}
</Card>
