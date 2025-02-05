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
	import { nftMint, nftTransfer, nftResolve } from '$stores/nft';
	import { nftsEntryCreate, nftsEntryRemove } from '$stores/nfts';

	export let itemId: string | undefined;
	export let returnUrl: string;
	let validationErrors: {
		[field in 'issuer' | 'tag' | 'owner']?: IValidationFailure[] | undefined;
	} = {};
	let busy = false;
	let transferView = false;
	let signature: string | undefined;
	let progress: string | undefined;
	let issuer: string | undefined = '';
	let tag: string | undefined = '';
	let name: string | undefined = '';
	let description: string | undefined = '';
	let uri: string | undefined = '';
	let owner: string | undefined = '';
	let newMetadataKey: string | undefined = undefined;
	let newMetadataValue: string | undefined = undefined;
	let metadata: unknown | undefined = undefined;
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

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'issuer',
			Is.stringValue(issuer) ? issuer : undefined,
			validationFailures,
			$i18n('pages.nftProperties.issuer')
		);

		Validation.notEmpty(
			'tag',
			Is.stringValue(tag) ? tag : undefined,
			validationFailures,
			$i18n('pages.nftProperties.tag')
		);
	}

	async function validateTransfer(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'owner',
			Is.stringValue(owner) ? owner : undefined,
			validationFailures,
			$i18n('pages.nftProperties.owner')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		signature = undefined;
		itemId = undefined;

		issuer = $profileIdentity;
		if (Is.stringValue(issuer) && Is.stringValue(tag)) {
			progress = $i18n('pages.nftProperties.progress');
			let immutableMetadata: { [key: string]: unknown } | undefined = undefined;
			if (Is.stringValue(name) || Is.stringValue(description) || Is.stringValue(uri)) {
				immutableMetadata = {};
				immutableMetadata.name = name ?? '';
				immutableMetadata.description = description ?? '';
				immutableMetadata.uri = uri ?? '';
			}

			const result = await nftMint(issuer, tag, immutableMetadata, metadata);
			progress = '';

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}

			itemId = result?.nftId;

			if (Is.stringValue(itemId)) {
				await nftsEntryCreate({
					id: itemId,
					nftId: itemId,
					issuer,
					tag,
					owner: issuer
				});
			}
		}

		return undefined;
	}

	async function transfer(): Promise<string | undefined> {
		signature = undefined;

		if (Is.stringValue(itemId) && Is.stringValue(owner)) {
			progress = $i18n('pages.nftProperties.progress');

			const result = await nftTransfer(itemId, owner, metadata);
			progress = '';

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}

			await nftsEntryRemove(itemId);

			await nftsEntryCreate({
				id: itemId,
				nftId: itemId,
				issuer: item?.issuer ?? '',
				tag: item?.tag ?? '',
				owner
			});

			await goto(`/secure/nft/${itemId}`);
		}

		return undefined;
	}

	function addMetadata(): void {
		if(Is.stringValue(newMetadataKey) && Is.stringValue(newMetadataValue)) {
			if(Is.undefined(metadata)) {
				metadata = {};
			}
			(metadata as { [key: string]: unknown })[newMetadataKey] = newMetadataValue;
			newMetadataKey = undefined;
			newMetadataValue = undefined;
		}
	}

	onMount(async () => {
		busy = true;
		issuer = $profileIdentity;
		if (!Is.undefined(itemId)) {
			transferView = true;
			item = await nftResolve(itemId);
			metadata = item?.metadata;
		}
		busy = false;
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if transferView}
		<ValidatedForm
			title={$i18n('pages.nftProperties.transferTitle')}
			actionButtonLabel={$i18n('pages.nftProperties.transfer')}
			actionSuccessLabel={$i18n('pages.nftProperties.transferSuccess')}
			validationMethod={validateTransfer}
			actionMethod={transfer}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					Current {$i18n('pages.nftProperties.owner')}:
					<Span>{item?.owner}</Span>
				</Label>
				<Label>
					New {$i18n('pages.nftProperties.owner')}
					<Input
						name="owner"
						placeholder={$i18n('pages.nftProperties.owner')}
						color={Is.arrayValue(validationErrors.owner) ? 'error' : 'default'}
						bind:value={owner}
						disabled={busy}
					></Input>
					<ValidationError validationErrors={validationErrors.owner} />
				</Label><Label>
					{$i18n('pages.nftProperties.metadata')}
				</Label>
				{#if Is.objectValue(metadata)}
					{#each Object.keys(metadata) as key}
						<div>
							<Label class="flex flex-row gap-2">
								<b>{key}:</b> {metadata[key]}
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
				<div class="text-right mb-5">
					<Button class="w-40" on:click={addMetadata}>
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
	{:else if !Is.stringValue(itemId)}
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
					{$i18n('pages.nftProperties.issuer')}
					<Input
						name="issuer"
						placeholder={$i18n('pages.nftProperties.issuer')}
						color={Is.arrayValue(validationErrors.issuer) ? 'error' : 'default'}
						bind:value={issuer}
						disabled
					></Input>
					<ValidationError validationErrors={validationErrors.issuer} />
				</Label>
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
					{$i18n('pages.nftProperties.metadata')}
				</Label>
				{#if Is.objectValue(metadata)}
					{#each Object.keys(metadata) as key}
						<div>
							<Label class="flex flex-row gap-2">
								<b>{key}:</b> {metadata[key]}
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
				<div class="text-right mb-5">
					<Button class="w-40" on:click={addMetadata}>
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
