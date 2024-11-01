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
		P,
		QR,
		Span,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { createPrivateUrl } from '$stores/app';
	import { blobStorageUpload } from '$stores/blobStorage';

	export let returnUrl: string;
	let description = '';
	let files: FileList | undefined;
	let validationErrors: {
		[field in 'description' | 'filename']?: IValidationFailure[] | undefined;
	} = {};
	let busy = false;
	let itemId: string | undefined;
	let progress: string | undefined;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'description',
			Is.stringValue(description) ? description : undefined,
			validationFailures,
			$i18n('pages.blobProperties.description')
		);

		Validation.notEmpty(
			'filename',
			Is.stringValue(files?.[0]?.name) ? files[0].name : undefined,
			validationFailures,
			$i18n('pages.blobProperties.filename')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		itemId = undefined;
		if (!Is.empty(files) && files.length > 0) {
			progress = $i18n('pages.blobProperties.progress');

			const file = files[0];
			const buffer = await file.arrayBuffer();
			const bytes = new Uint8Array(buffer);
			const blobMetadata: IJsonLdNodeObject = {
				'@context': 'https://schema.org',
				type: 'Thing',
				name: description
			};
			const result = await blobStorageUpload(file.type, blobMetadata, bytes);
			progress = undefined;
			busy = false;

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}

			itemId = result?.id ?? '';
		}

		return undefined;
	}
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !Is.stringValue(itemId)}
		<ValidatedForm
			title={$i18n('pages.blobProperties.title')}
			actionButtonLabel={$i18n('pages.blobProperties.action')}
			actionSuccessLabel={$i18n('pages.blobProperties.actionSuccess')}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.blobProperties.description')}
					<Input
						type="text"
						name="description"
						color={Is.arrayValue(validationErrors.description) ? 'error' : 'default'}
						bind:value={description}
						disabled={busy}
					/>
					<ValidationError validationErrors={validationErrors.description} />
				</Label>
				<Label>
					{$i18n('pages.blobProperties.filename')}
					<Fileupload
						name="filename"
						color={Is.arrayValue(validationErrors.filename) ? 'error' : 'default'}
						bind:files
						disabled={busy}
					/>
					<ValidationError validationErrors={validationErrors.filename} />
				</Label>
			{/snippet}
			{#snippet afterAction()}
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			{/snippet}
		</ValidatedForm>
	{:else}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5">{$i18n('pages.blobProperties.resultTitle')}</Heading>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.blobProperties.itemId')}
					<Span>{itemId}</Span>
				</Label>
				<Label>
					{$i18n('pages.blobProperties.itemQr')}
					<QR
						class="mt-2"
						qrData={createPrivateUrl(`blob/${itemId}`)}
						href={createPrivateUrl(`blob/${itemId}`)}
						label={$i18n('pages.blobProperties.itemQr')}
						dimensions={128}
					/>
				</Label>
			{/if}
			<Button on:click={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
