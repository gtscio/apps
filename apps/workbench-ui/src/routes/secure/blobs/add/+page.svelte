<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is, Validation, type IValidationFailure } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Button,
		Card,
		Fileupload,
		Heading,
		i18n,
		Input,
		Label,
		LabelledValue,
		P,
		QR,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { createPrivateUrl } from '$stores/app';
	import { blobStorageUpload } from '$stores/blobStorage';

	let description = '';
	let filename = '';
	let files: FileList | undefined;
	let validationErrors: {
		[field in 'description' | 'filename']?: IValidationFailure[] | undefined;
	} = {};
	let isBusy = false;
	let blobId: string | undefined;
	let progress: string | undefined;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'description',
			Is.stringValue(description) ? description : undefined,
			validationFailures,
			$i18n('pages.blobAdd.description')
		);

		Validation.notEmpty(
			'filename',
			Is.stringValue(filename) ? filename : undefined,
			validationFailures,
			$i18n('pages.blobAdd.filename')
		);
	}

	async function close(): Promise<void> {
		await goto('/secure/blobs');
	}

	async function action(): Promise<string | undefined> {
		blobId = undefined;
		if (!Is.empty(files) && files.length > 0) {
			progress = $i18n('pages.blobAdd.progressUploading');

			const file = files[0];
			const buffer = await file.arrayBuffer();
			const bytes = new Uint8Array(buffer);
			const blobMetadata: IJsonLdNodeObject = {
				'@context': 'https://schema.org',
				type: 'Thing',
				name: file.name
			};
			const resultBlob = await blobStorageUpload(file.type, blobMetadata, bytes);
			if (Is.stringValue(resultBlob?.error)) {
				progress = undefined;
				return resultBlob?.error;
			}
			blobId = resultBlob?.id ?? '';

			progress = undefined;
		}

		return undefined;
	}
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !Is.stringValue(blobId)}
		<ValidatedForm
			titleResource="pages.blobAdd.title"
			actionButtonResource="pages.blobAdd.upload"
			actionSuccessResource="pages.blobAdd.uploadSuccess"
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:isBusy
		>
			<svelte:fragment slot="fields">
				<Label>
					{$i18n('pages.blobAdd.description')}
					<Input
						type="text"
						name="description"
						color={Is.arrayValue(validationErrors.description) ? 'red' : 'base'}
						bind:value={description}
						disabled={isBusy}
					/>
					<ValidationError validationErrors={validationErrors.description} />
				</Label>
				<Label>
					{$i18n('pages.blobAdd.filename')}
					<Fileupload
						type="text"
						name="filename"
						color={Is.arrayValue(validationErrors.filename) ? 'red' : 'base'}
						bind:value={filename}
						bind:files
						disabled={isBusy}
					/>
					<ValidationError validationErrors={validationErrors.filename} />
				</Label>
			</svelte:fragment>
			<svelte:fragment slot="after-action">
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			</svelte:fragment>
		</ValidatedForm>
	{/if}
	{#if Is.stringValue(blobId)}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5">{$i18n('pages.blobAdd.resultTitle')}</Heading>
			{#if Is.stringValue(blobId)}
				<Label>
					{$i18n('pages.blobAdd.blobId')}
					<LabelledValue>{blobId}</LabelledValue>
				</Label>
				<Label>
					{$i18n('pages.blobAdd.blobQr')}
					<QR
						class="mt-2"
						qrData={createPrivateUrl(`blobs/${blobId}`)}
						labelResource="pages.blobAdd.blobQr"
						dimensions={128}
					/>
				</Label>
			{/if}
			<Button on:click={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
