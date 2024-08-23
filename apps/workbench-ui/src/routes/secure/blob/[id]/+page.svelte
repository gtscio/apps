<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import { Converter, Is } from '@gtsc/core';
	import { PropertyHelper, type IProperty } from '@gtsc/schema';
	import { ArrowUpRightFromSquareOutline, DownloadOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { Button, Card, Heading, Label, Spinner } from '../../../../components/design-system';
	import Error from '../../../../components/error.svelte';
	import LabelledValue from '../../../../components/labelledValue.svelte';
	import Qr from '../../../../components/qr.svelte';
	import { createPrivateUrl } from '../../../../stores/app';
	import { blobStorageGet, createDownloadLink } from '../../../../stores/blobStorage';
	import { i18n } from '../../../../stores/i18n';

	const id = $page.params.id;
	let filename: string | undefined;
	let mimeType: string | undefined;
	let blobInlineUrl: string;
	let blobDownloadUrl: string;
	let metadata: IProperty[] | undefined;
	let error: string;
	let includeText: string = '';
	let isBusy = true;

	onMount(async () => {
		error = '';
		const result = await blobStorageGet(id, false);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else {
			metadata = result?.metadata;

			filename = PropertyHelper.getText(metadata, 'filename');
			mimeType = PropertyHelper.getText(metadata, 'mimeType');
			blobDownloadUrl = createDownloadLink(id, true, filename);

			if (Is.stringValue(mimeType) && (mimeType.includes('text') || mimeType.includes('xml'))) {
				const resultWithContent = await blobStorageGet(id, true);
				if (Is.uint8Array(resultWithContent?.blob)) {
					includeText = Converter.bytesToUtf8(resultWithContent?.blob);
				}
			} else {
				blobInlineUrl = createDownloadLink(id, false, filename);
			}
		}
		isBusy = false;
	});

	function downloadDocument(): void {
		const a = document.createElement('a');
		a.href = blobDownloadUrl;
		a.download = filename ?? 'document';
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
			<Spinner size={5} color="white" />
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
				{#if Is.stringValue(mimeType)}
					<Label>
						{$i18n('pages.blob.mimeType')}
						<LabelledValue>{mimeType}</LabelledValue>
					</Label>
				{/if}
			</div>
			<Qr
				qrData={createPrivateUrl(`blob/${id}`)}
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
</Card>
