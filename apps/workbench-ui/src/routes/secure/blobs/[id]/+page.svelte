<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Converter, Is, ObjectHelper } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Button,
		Card,
		Error,
		Heading,
		i18n,
		Label,
		LabelledValue,
		QR,
		Spinner
	} from '@twin.org/ui-components-svelte';
	import { ArrowUpRightFromSquareOutline, DownloadOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { createPrivateUrl } from '$stores/app';
	import { blobStorageGet, createDownloadLink } from '$stores/blobStorage';

	const id = $page.params.id;
	let encodingFormat: string | undefined;
	let fileExtension: string | undefined;
	let metadata: IJsonLdNodeObject | undefined;
	let filename: string | undefined;
	let blobInlineUrl: string;
	let blobDownloadUrl: string;
	let error: string;
	let includeText: string = '';
	let isBusy = true;

	onMount(async () => {
		error = '';
		const result = await blobStorageGet(id, false);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else {
			encodingFormat = result?.data?.encodingFormat;
			fileExtension = result?.data?.fileExtension;
			metadata = result?.data?.metadata;
			blobDownloadUrl = createDownloadLink(id, true);

			filename = ObjectHelper.propertyGet(metadata, 'name');

			if (
				Is.stringValue(encodingFormat) &&
				(encodingFormat.includes('text') || encodingFormat.includes('xml'))
			) {
				const resultWithContent = await blobStorageGet(id, true);
				if (Is.stringValue(resultWithContent?.data?.blob)) {
					includeText = Converter.bytesToUtf8(
						Converter.base64ToBytes(resultWithContent?.data?.blob)
					);
				}
			} else {
				blobInlineUrl = createDownloadLink(id, false);
			}
		}
		isBusy = false;
	});

	function downloadDocument(): void {
		const a = document.createElement('a');
		a.href = blobDownloadUrl;
		a.download = filename ?? `document.${fileExtension ?? 'bin'}`;
		a.click();
	}
	function openDocument(): void {
		const a = document.createElement('a');
		a.href = blobInlineUrl;
		a.target = '_blank';
		a.click();
	}
</script>

<Card class="h-full max-h-full max-w-full gap-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.blob.title')}</Heading>
		{#if isBusy}
			<Spinner />
		{/if}
	</div>
	{#if !isBusy}
		<Error {error} />
		<div class="flex flex-row justify-between gap-5">
			<div class="flex flex-col gap-4">
				<Label>
					{$i18n('pages.blob.id')}
					<LabelledValue>{id}</LabelledValue>
				</Label>
				{#if Is.stringValue(filename)}
					<Label>
						{$i18n('pages.blob.filename')}
						<LabelledValue>{filename}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(fileExtension)}
					<Label>
						{$i18n('pages.blob.extension')}
						<LabelledValue>{fileExtension}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(encodingFormat)}
					<Label>
						{$i18n('pages.blob.mimeType')}
						<LabelledValue>{encodingFormat}</LabelledValue>
					</Label>
				{/if}
			</div>
			<QR
				qrData={createPrivateUrl(`blobs/${id}`)}
				labelResource="pages.identityProfile.qr"
				dimensions={128}
			/>
		</div>
		{#if Is.stringValue(blobInlineUrl) || Is.stringValue(includeText)}
			<div class="flex h-full w-full flex-col gap-2">
				<div class="flex flex-row justify-between align-bottom">
					<Label class="mt-1">{$i18n('pages.blob.document')}</Label>
					<div class="flex flex-row gap-3">
						<Button on:click={openDocument} size="xs">
							<ArrowUpRightFromSquareOutline size="sm" />
						</Button>
						<Button on:click={downloadDocument} size="xs">
							<DownloadOutline size="sm" />
						</Button>
					</div>
				</div>
				{#if Is.stringValue(includeText)}
					<div class="h-full w-full rounded-md border dark:border-neutral-700">
						<pre class="h-full w-full overflow-auto p-2 text-xs">{includeText}</pre>
					</div>
				{:else}
					<iframe
						src={blobInlineUrl}
						class="h-full w-full rounded-md border dark:border-neutral-700"
						title={$i18n('pages.blob.document')}
					></iframe>
				{/if}
			</div>
		{/if}
	{/if}
	<div class="flex flex-row gap-2">
		<Button on:click={() => goto('/secure/blobs')}>{$i18n('actions.back')}</Button>
	</div>
</Card>
