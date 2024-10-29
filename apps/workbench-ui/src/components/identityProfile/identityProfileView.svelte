<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, ObjectHelper, Urn } from '@twin.org/core';
	import type { IDidDocument } from '@twin.org/standards-w3c-did';
	import {
		Button,
		Card,
		Code,
		Error,
		Heading,
		Icons,
		Label,
		QR,
		Span,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { createPublicUrl } from '$stores/app';
	import { identityGetPublic } from '$stores/identity';
	import { profileGetPublic } from '$stores/identityProfile';
	import { createExplorerIdentityUrl } from '$stores/iota';

	export let itemId: string;
	let error: string;
	let didDocument: IDidDocument | undefined;
	let busy = true;
	let exploreUrl: string | undefined;
	let displayName: string | undefined;
	let schema: string | undefined;

	const urn = Urn.fromValidString(itemId);
	if (urn.namespaceMethod() === 'iota') {
		exploreUrl = createExplorerIdentityUrl(itemId);
	}

	onMount(async () => {
		error = '';

		const resultProfile = await profileGetPublic(itemId);
		if (Is.stringValue(resultProfile?.error)) {
			error = resultProfile.error;
		} else {
			const context = ObjectHelper.propertyGet<string>(resultProfile?.profile, '@context');
			const type = ObjectHelper.propertyGet<string>(resultProfile?.profile, '@type');
			schema = `${context}/${type}`;
			displayName = ObjectHelper.propertyGet<string>(resultProfile?.profile, 'name');
		}

		const resultIdentity = await identityGetPublic(itemId);
		if (Is.stringValue(resultIdentity?.error)) {
			error += resultIdentity.error;
		} else {
			didDocument = resultIdentity?.document;
		}
		busy = false;
	});

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.identityPublic.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	<Error {error} />
	{#if !busy}
		<div class="flex flex-row justify-between gap-5">
			<div class="flex flex-col gap-4">
				<Label>
					{$i18n('pages.identityPublic.identity')}
					<Span>{itemId}</Span>
				</Label>
				{#if Is.stringValue(schema)}
					<Label>
						{$i18n('pages.identityPublic.schema')}
						<Span>{schema}</Span>
					</Label>
				{/if}
				{#if Is.stringValue(displayName)}
					<Label>
						{$i18n('pages.identityPublic.displayName')}
						<Span>{displayName}</Span>
					</Label>
				{/if}
				{#if Is.stringValue(exploreUrl)}
					<Label>
						<Button size="xs" on:click={openExplorer} color="plain" class="max-w-32 gap-2"
							>{$i18n('pages.identityPublic.explore')}<Icons.CloudArrowUpOutline
								size="sm"
							/></Button
						>
					</Label>
				{/if}
			</div>
			<QR
				qrData={createPublicUrl(`identity/${itemId}`)}
				label={$i18n('pages.identityPublic.qr')}
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
