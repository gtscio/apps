<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is, Validation, type IValidationFailure } from '@twin.org/core';
	import {
		Button,
		Card,
		Heading,
		i18n,
		Label,
		P,
		QR,
		Input,
		Span,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { createPublicUrl } from '$stores/app';
	import { profileIdentity } from '$stores/identityProfile';
	import { nftMint } from '$stores/nft';
	import { nftsEntrySet } from '$stores/nfts';

	export let returnUrl: string;
	let validationErrors: {
		[field in 'issuer' | 'tag' | 'owner']?: IValidationFailure[] | undefined;
	} = {};
	let busy = false;
	let signature: string | undefined;
	let progress: string | undefined;
	let itemId: string | undefined;
	let namespace: string | undefined = undefined;
	let tag: string | undefined = '';
	let name: string | undefined = '';
	let description: string | undefined = '';
	let uri: string | undefined = '';
	let newMetadataKey: string | undefined = undefined;
	let newMetadataValue: string | undefined = undefined;
	let metadata: unknown | undefined = undefined;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'tag',
			Is.stringValue(tag) ? tag : undefined,
			validationFailures,
			$i18n('pages.nftProperties.tag')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		signature = undefined;
		itemId = undefined;

		if (Is.stringValue(tag)) {
			progress = $i18n('pages.nftProperties.progress');
			let immutableMetadata: { [key: string]: unknown } | undefined = undefined;
			if (Is.stringValue(name) || Is.stringValue(description) || Is.stringValue(uri)) {
				immutableMetadata = {};
				immutableMetadata.name = name ?? '';
				immutableMetadata.description = description ?? '';
				immutableMetadata.uri = uri ?? '';
			}

			const result = await nftMint(tag, immutableMetadata, metadata, namespace);
			progress = '';

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}

			itemId = result?.nftId;

			if (Is.stringValue(itemId)) {
				await nftsEntrySet({
					id: itemId,
					nftId: itemId,
					issuer: $profileIdentity,
					tag,
					owner: $profileIdentity
				});
			}
		}

		return undefined;
	}

	function addMetadata(): void {
		if (Is.stringValue(newMetadataKey) && Is.stringValue(newMetadataValue)) {
			if (Is.undefined(metadata)) {
				metadata = {};
			}
			(metadata as { [key: string]: unknown })[newMetadataKey] = newMetadataValue;
			newMetadataKey = undefined;
			newMetadataValue = undefined;
		}
	}

	onMount(async () => {
		busy = false;
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !Is.stringValue(itemId)}
		<ValidatedForm
			title={$i18n('pages.nftProperties.title')}
			actionButtonLabel={$i18n('pages.nftProperties.action')}
			actionSuccessLabel={$i18n('pages.nftProperties.actionSuccess')}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.nftProperties.tag')}
					<Input
						name="tag"
						placeholder={$i18n('pages.nftProperties.tag')}
						color={Is.arrayValue(validationErrors.tag) ? 'error' : 'default'}
						bind:value={tag}
						disabled={busy}
					></Input>
					<ValidationError validationErrors={validationErrors.tag} />
				</Label>
				<Label>
					{$i18n('pages.nftProperties.immutableMetadata')}
				</Label>
				<Label>
					{$i18n('pages.nftProperties.name')}
					<Input
						name="name"
						placeholder={$i18n('pages.nftProperties.name')}
						color="default"
						bind:value={name}
						disabled={busy}
					></Input>
				</Label>
				<Label>
					{$i18n('pages.nftProperties.description')}
					<Input
						name="description"
						placeholder={$i18n('pages.nftProperties.description')}
						color="default"
						bind:value={description}
						disabled={busy}
					></Input>
				</Label>
				<Label>
					{$i18n('pages.nftProperties.uri')}
					<Input
						name="uri"
						placeholder={$i18n('pages.nftProperties.uri')}
						color="default"
						bind:value={uri}
						disabled={busy}
					></Input>
				</Label>
				<Label>
					{$i18n('pages.nftProperties.namespace')}
					<Input
						name="namespace"
						placeholder={$i18n('pages.nftProperties.namespace')}
						color="default"
						bind:value={namespace}
						disabled={busy}
					></Input>
				</Label>
				<Label>
					{$i18n('pages.nftProperties.metadata')}
				</Label>
				{#if Is.objectValue(metadata)}
					{#each Object.keys(metadata) as key}
						<div>
							<Label class="flex flex-row gap-2">
								<b>{key}:</b>
								{metadata[key]}
							</Label>
						</div>
					{/each}
				{/if}
				<div class="flex flex-row gap-2">
					<Label>
						{$i18n('pages.nftProperties.newMetadataKey')}
						<Input
							name="newMetadataKey"
							placeholder={$i18n('pages.nftProperties.newMetadataKey')}
							color="default"
							bind:value={newMetadataKey}
							disabled={busy}
						></Input>
					</Label>
					<Label>
						{$i18n('pages.nftProperties.newMetadataValue')}
						<Input
							name="newMetadataValue"
							placeholder={$i18n('pages.nftProperties.newMetadataValue')}
							color="default"
							bind:value={newMetadataValue}
							disabled={busy}
						></Input>
					</Label>
				</div>
				<div class="mb-5 text-right">
					<Button class="w-40" on:click={addMetadata} disabled={busy}>
						{$i18n('pages.nftProperties.addMetadata')}
					</Button>
				</div>
			{/snippet}
			{#snippet afterAction()}
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			{/snippet}
		</ValidatedForm>
	{:else}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5">{$i18n('pages.nftProperties.resultTitle')}</Heading>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.nftProperties.nftId')}
					<Span>{itemId}</Span>
				</Label>
				<Label>
					{$i18n('pages.nftProperties.nftQr')}
					<QR
						class="mt-2"
						qrData={createPublicUrl(`nft/${itemId}`)}
						href={createPublicUrl(`nft/${itemId}`)}
						label={$i18n('pages.nftProperties.nftQr')}
						dimensions={128}
					/>
				</Label>
			{/if}
			{#if Is.stringValue(signature)}
				<Label>
					{$i18n('pages.nftProperties.signature')}
					<Span>{signature}</Span>
				</Label>
			{/if}
			<Button on:click={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
