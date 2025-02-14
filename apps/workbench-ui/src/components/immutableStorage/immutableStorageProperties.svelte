<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Converter, Is, Validation, type IValidationFailure } from '@twin.org/core';
	import {
		Button,
		Card,
		Heading,
		i18n,
		Input,
		Label,
		P,
		QR,
		Span,
		ValidatedForm,
		ValidationError,
		Textarea
	} from '@twin.org/ui-components-svelte';
	import { createPrivateUrl } from '$stores/app';
	import { immutableStorageUpload } from '$stores/immutableStorage';
	import { immutableStoragesEntrySet } from '$stores/immutableStorages';

	export let returnUrl: string;
	let description = '';
	let textContent = '';
	let validationErrors: {
		[field in 'description' | 'textContent']?: IValidationFailure[] | undefined;
	} = {};
	let busy = false;
	let itemId: string | undefined;
	let progress: string | undefined;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'description',
			Is.stringValue(description) ? description : undefined,
			validationFailures,
			$i18n('pages.immutableStorageProperties.description')
		);
		Validation.notEmpty(
			'textContent',
			Is.stringValue(textContent) ? textContent : undefined,
			validationFailures,
			$i18n('pages.immutableStorageProperties.textContent')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		itemId = undefined;

		progress = $i18n('pages.immutableStorageProperties.progress');

		const data = Converter.utf8ToBytes(textContent);
		const result = await immutableStorageUpload(data);

		progress = undefined;
		busy = false;

		if (Is.stringValue(result?.error)) {
			return result?.error;
		}

		itemId = result?.id;

		if (Is.stringValue(itemId)) {
			await immutableStoragesEntrySet({
				id: itemId,
				description,
				data: Converter.bytesToBase64(data),
				date: new Date().toISOString()
			});
		}

		return undefined;
	}
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !Is.stringValue(itemId)}
		<ValidatedForm
			title={$i18n('pages.immutableStorageProperties.title')}
			actionButtonLabel={$i18n('pages.immutableStorageProperties.action')}
			actionSuccessLabel={$i18n('pages.immutableStorageProperties.actionSuccess')}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.immutableStorageProperties.description')}
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
					{$i18n('pages.immutableStorageProperties.textContent')}
					<Textarea
						name="textContent"
						color={Is.arrayValue(validationErrors.textContent) ? 'error' : 'default'}
						bind:value={textContent}
						disabled={busy}
					/>
					<ValidationError validationErrors={validationErrors.textContent} />
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
			<Heading tag="h5">{$i18n('pages.immutableStorageProperties.resultTitle')}</Heading>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.immutableStorageProperties.itemId')}
					<Span>{itemId}</Span>
				</Label>
				<Label>
					{$i18n('pages.immutableStorageProperties.itemQr')}
					<QR
						class="mt-2"
						qrData={createPrivateUrl(`immutable-storage/${itemId}`)}
						href={createPrivateUrl(`immutable-storage/${itemId}`)}
						label={$i18n('pages.immutableStorageProperties.itemQr')}
						dimensions={128}
					/>
				</Label>
			{/if}
			<Button on:click={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
