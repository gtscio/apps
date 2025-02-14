<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Converter, Is, ObjectHelper } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Button,
		Card,
		Error,
		Heading,
		i18n,
		Icons,
		Label,
		QR,
		Span,
		Spinner,
		Tooltip
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { createPrivateUrl } from '$stores/app';
	import { immutableStorageGet } from '$stores/immutableStorage';

	export let itemId: string | undefined = undefined;
	let receipt: IJsonLdNodeObject | undefined;
	let description: string | undefined;
	let error: string;
	let includeText: string | undefined;
	let busy = true;

	onMount(async () => {
		if (Is.stringValue(itemId)) {
			error = '';
			const result = await immutableStorageGet(itemId);

			if (Is.stringValue(result?.error)) {
				error = result.error;
			} else {
				receipt = result?.receipt;
				description = ObjectHelper.propertyGet(receipt, 'receipt');
				const storedData = ObjectHelper.propertyGet(result, 'data');

				if (Is.uint8Array(storedData)) {
					includeText = Converter.bytesToUtf8(storedData);
				}
			}
			busy = false;
		}
	});

	async function copyData(data?: string): Promise<void> {
		if (!data) {
			return;
		}
		await navigator.clipboard.writeText(data);
	}
</script>

<Card class="h-full max-h-full max-w-full gap-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.immutableStorageView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	{#if !busy}
		<div class="flex flex-col justify-between gap-5">
			<div class="flex flex-col justify-between gap-4 md:flex-row">
				<div class="flex flex-col gap-4">
					<Label>
						{$i18n('pages.immutableStorageView.id')}
						<Span>{itemId}</Span>
					</Label>
					<Label>
						{$i18n('pages.immutableStorageView.receipt')}
						<Span>{JSON.stringify(receipt, null, 2)}</Span>
					</Label>
					{#if Is.stringValue(description)}
						<Label>
							{$i18n('pages.immutableStorageView.description')}
							<Span>{description}</Span>
						</Label>
					{/if}
				</div>
				<QR
					qrData={createPrivateUrl(`immutable/${itemId}`)}
					label={$i18n('pages.immutableStorage.qr')}
					dimensions={128}
				/>
			</div>
		</div>
		{#if Is.stringValue(includeText)}
			<div class="flex h-full w-full flex-col gap-2">
				<div class="flex flex-row justify-between align-bottom">
					<Label class="mt-1">{$i18n('pages.immutableStorageView.document')}</Label>
					<div class="flex flex-row gap-3">
						<Button size="xs" color="plain" on:click={async () => copyData(includeText)}>
							<Icons.ClipboardListOutline />
						</Button>
						<Tooltip>{$i18n('pages.immutableStorage.copyDataClipboard')}</Tooltip>
					</div>
				</div>
				<div class="h-full w-full rounded-md border dark:border-neutral-700">
					<pre class="h-full w-full overflow-auto p-2 text-xs">{includeText}</pre>
				</div>
			</div>
		{/if}
		<Error {error} />
	{/if}
	<div class="flex flex-row gap-2">
		<Button on:click={() => goto('/secure/immutable-storage')}>{$i18n('actions.back')}</Button>
	</div>
</Card>
