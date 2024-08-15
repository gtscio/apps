<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import { Is } from '@gtsc/core';
	import { PropertyHelper, type IProperty } from '@gtsc/schema';
	import { Button, Card, Label } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { blobStorageGet, createDownloadLink } from '../../../../stores/blobStorage';
	import { i18n } from '../../../../stores/i18n';

	const id = $page.params.id;
	let filename: string | undefined;
	let mimeType: string | undefined;
	let blobInlineUrl: string;
	let blobDownloadUrl: string;
	let metadata: IProperty[] | undefined;
	let error: string;

	onMount(async () => {
		error = '';
		const result = await blobStorageGet(id);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else {
			metadata = result?.metadata;

			filename = PropertyHelper.getText(metadata, 'filename');
			mimeType = PropertyHelper.getText(metadata, 'mimeType');
			blobInlineUrl = createDownloadLink(id, false, filename);
			blobDownloadUrl = createDownloadLink(id, true, filename);
		}
	});

	function downloadDocument(): void {
		const a = document.createElement('a');
		a.href = blobDownloadUrl;
		a.download = filename ?? 'document';
		a.click();
	}
</script>

<Card class="h-full max-h-full max-w-full gap-4">
	<div>
		<Label>
			{$i18n('pages.blob.id')}
		</Label>
		<span class="whitespace-pre-wrap break-all">{id}</span>
	</div>
	{#if Is.stringValue(error)}
		<div color="red">
			{error}
		</div>
	{:else}
		{#if Is.stringValue(filename)}
			<Label>
				{$i18n('pages.blob.filename')}
			</Label>
			{filename}
		{/if}
		{#if Is.stringValue(mimeType)}
			<Label>
				{$i18n('pages.blob.mimeType')}
			</Label>
			{mimeType}
		{/if}
		{#if Is.stringValue(blobInlineUrl)}
			<div class="flex flex-row justify-between align-middle">
				<Label>
					{$i18n('pages.blob.document')}
				</Label>
				<Button on:click={downloadDocument}>
					{$i18n('pages.blob.download')}
				</Button>
			</div>
			<iframe src={blobInlineUrl} class="h-full w-full" title={$i18n('pages.blob.document')}
			></iframe>
		{/if}
	{/if}
</Card>
