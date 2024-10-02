<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import { Is, ObjectHelper, Urn } from '@twin.org/core';
	import type { IDidDocument } from '@twin.org/standards-w3c-did';
	import {
		Button,
		Card,
		Code,
		Error,
		Heading,
		Label,
		LabelledValue,
		QR,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { CloudArrowUpOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { createPublicUrl } from '$stores/app';
	import { identityGetPublic } from '$stores/identity';
	import { profileGetPublic } from '$stores/identityProfile';
	import { createExplorerIdentityUrl } from '$stores/iota';

	const identity = $page.params.identity;
	let error: string;
	let didDocument: IDidDocument | undefined;
	let isBusy = true;
	let exploreUrl: string | undefined;
	let displayName: string | undefined;
	let schema: string | undefined;

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
			const context = ObjectHelper.propertyGet<string>(resultProfile?.profile, '@context');
			const type = ObjectHelper.propertyGet<string>(resultProfile?.profile, '@type');
			schema = `${context}/${type}`;
			displayName = ObjectHelper.propertyGet<string>(resultProfile?.profile, 'name');
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
			<Spinner />
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
				{#if Is.stringValue(schema)}
					<Label>
						{$i18n('pages.identityPublic.schema')}
						<LabelledValue>{schema}</LabelledValue>
					</Label>
				{/if}
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
			<QR
				qrData={createPublicUrl(`identity/${identity}`)}
				labelResource="pages.identityPublic.qr"
				dimensions={128}
			/>
		</div>
		{#if Is.object(didDocument)}
			<Label>
				{$i18n('pages.identityPublic.didDocument')}
				<Code>
					{JSON.stringify(didDocument, undefined, 2)}
				</Code>
			</Label>
		{/if}
	{/if}
</Card>
