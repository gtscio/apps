<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type { IAuditableItemStream } from '@twin.org/auditable-item-stream-models';
	import { Is, ObjectHelper, Validation, type IValidationFailure } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import { SchemaOrgTypes } from '@twin.org/standards-schema-org';
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
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { createPrivateUrl } from '$stores/app';
	import {
		auditableItemStreamCreate,
		auditableItemStreamGet,
		auditableItemStreamUpdate
	} from '$stores/auditableItemStreams';

	export let itemId: string | undefined = undefined;

	let originalItem: IAuditableItemStream | undefined;
	let isCreate = !Is.stringValue(itemId);
	let description = '';
	let validationErrors: {
		[field in 'description']?: IValidationFailure[] | undefined;
	} = {};
	let busy = false;
	let progress: string | undefined;
	let result: string = '';
	let resultIsError: boolean = false;
	let saved: boolean = false;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'description',
			Is.stringValue(description) ? description : undefined,
			validationFailures,
			$i18n('pages.auditableItemStreamProperties.description')
		);
	}

	async function close(): Promise<void> {
		await goto('/secure/auditable-item-stream');
	}

	async function action(): Promise<string | undefined> {
		progress = $i18n(
			isCreate
				? 'pages.auditableItemStreamProperties.progressCreate'
				: 'pages.auditableItemStreamProperties.progressUpdate'
		);

		const streamObject: IJsonLdNodeObject = {
			'@context': SchemaOrgTypes.ContextRoot,
			type: 'Thing',
			name: description
		};

		let res:
			| {
					error?: string;
					id?: string;
			  }
			| undefined;
		if (isCreate) {
			res = await auditableItemStreamCreate(streamObject);
			itemId = res?.id ?? '';
		} else {
			res = await auditableItemStreamUpdate(originalItem?.id ?? '', streamObject);
		}

		progress = undefined;
		busy = false;

		if (Is.stringValue(res?.error)) {
			return res?.error;
		}

		saved = true;

		return undefined;
	}

	onMount(async () => {
		if (Is.stringValue(itemId)) {
			busy = true;
			const getResult = await auditableItemStreamGet(itemId);

			if (Is.stringValue(getResult?.error)) {
				result = getResult?.error;
				resultIsError = true;
			} else if (Is.object(getResult?.item)) {
				originalItem = getResult?.item;
				isCreate = false;
				description = ObjectHelper.propertyGet(originalItem, 'streamObject.name') ?? '';
			}
			busy = false;
		}
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !saved}
		<ValidatedForm
			title={$i18n(
				isCreate
					? 'pages.auditableItemStreamProperties.titleCreate'
					: 'pages.auditableItemStreamProperties.titleModify'
			)}
			actionButtonLabel={$i18n(
				isCreate
					? 'pages.auditableItemStreamProperties.actionCreate'
					: 'pages.auditableItemStreamProperties.actionUpdate'
			)}
			actionSuccessLabel={$i18n(
				isCreate
					? 'pages.auditableItemStreamProperties.actionCreateSuccess'
					: 'pages.auditableItemStreamProperties.actionUpdateSuccess'
			)}
			validationMethod={validate}
			actionMethod={result ? undefined : action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
			bind:result
			bind:resultIsError
		>
			{#snippet fields()}
				{#if !Is.stringValue(result)}
					<Label>
						{$i18n('pages.auditableItemStreamProperties.description')}
						<Input
							type="text"
							name="description"
							color={Is.arrayValue(validationErrors.description) ? 'error' : 'default'}
							bind:value={description}
							disabled={busy}
						/>
						<ValidationError validationErrors={validationErrors.description} />
					</Label>
				{/if}
			{/snippet}
			{#snippet afterAction()}
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			{/snippet}
		</ValidatedForm>
	{:else}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5"
				>{$i18n(
					isCreate
						? 'pages.auditableItemStreamProperties.resultTitleCreate'
						: 'pages.auditableItemStreamProperties.resultTitleUpdate'
				)}</Heading
			>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.auditableItemStreamProperties.itemId')}
					<Span>{itemId}</Span>
				</Label>
				<Label>
					{$i18n('pages.auditableItemStreamProperties.itemQr')}
					<QR
						class="mt-2"
						qrData={createPrivateUrl(`auditable-item-stream/${itemId}`)}
						href={createPrivateUrl(`auditable-item-stream/${itemId}`)}
						label={$i18n('pages.auditableItemStreamProperties.itemQr')}
						dimensions={128}
					/>
				</Label>
			{/if}
			<Button on:click={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
