<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Card,
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
	import { nftResolve } from '$stores/nft';

	export let itemId: string;
	export let returnUrl: string | undefined = undefined;
	let error: string;
	let busy = true;
	let item:
		| Partial<{
				issuer?: string;
				owner?: string;
				tag?: string;
				immutableMetadata?: unknown;
				metadata?: unknown;
				error?: string;
		  }>
		| undefined;
	let exploreUrl: string | undefined;

	onMount(async () => {
		error = '';
		item = await nftResolve(itemId);
		busy = false;
	});

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('components.nftView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	<Error {error} />
	{#if !busy}
		<div class="flex flex-col justify-between gap-4">
			<div class="flex flex-col justify-between gap-4 md:flex-row">
				<div class="flex flex-col gap-4">
					<Label>
						{$i18n('components.nftView.id')}
						<Span>{itemId}</Span>
					</Label>
					{#if Is.stringValue(exploreUrl)}
						<div>
							<Button size="xs" on:click={openExplorer} color="plain" class="gap-2"
								>{$i18n('components.nftView.exploreNft')}<Icons.CloudArrowUpOutline
									size="sm"
								/></Button
							>
						</div>
					{/if}
				</div>
				<QR
					qrData={createPublicUrl(`nft/${itemId}`)}
					label={$i18n('components.nftView.nftQr')}
					dimensions={128}
				/>
			</div>
			<Label>
				{$i18n('components.nftView.issuer')}
				<Span>{item?.issuer}</Span>
			</Label>
			<Label>
				{$i18n('components.nftView.tag')}
				<Span>{item?.tag}</Span>
			</Label>
			<Label>
				{$i18n('components.nftView.owner')}
				<Span>{item?.owner}</Span>
			</Label>

			{#if !Is.undefined(item?.immutableMetadata)}
				<Label class="mb-2 mt-5">
					{$i18n('components.nftView.immutableMetadata')}
				</Label>
				{#if Is.object(item?.immutableMetadata)}
					{#each Object.keys(item?.immutableMetadata) as key}
						<Label class="flex flex-row gap-2">
							{$i18n(`components.nftView.${key}`)}
							<Span>{item?.immutableMetadata[key]}</Span>
						</Label>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
	{#if Is.stringValue(returnUrl)}
		<div class="flex flex-row gap-2">
			<Button on:click={() => goto(returnUrl)}>{$i18n('actions.back')}</Button>
		</div>
	{/if}
</Card>
