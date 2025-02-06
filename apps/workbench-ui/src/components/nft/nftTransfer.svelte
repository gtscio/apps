<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is, Validation, type IValidationFailure } from '@twin.org/core';
	import {
		Button,
		i18n,
		Label,
		P,
		Input,
		Span,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { nftTransfer, nftResolve } from '$stores/nft';
	import { nftsEntrySet } from '$stores/nfts';

	export let itemId: string | undefined;
	export let returnUrl: string;
	let validationErrors: {
		[field in 'issuer' | 'tag' | 'owner']?: IValidationFailure[] | undefined;
	} = {};
	let busy = false;
	let progress: string | undefined;
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
		if (Is.stringValue(itemId) && Is.stringValue(owner)) {
			progress = $i18n('pages.nftProperties.progress');

			const result = await nftTransfer(itemId, owner, metadata);
			progress = '';

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}

			await nftsEntrySet({
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
		busy = true;
		if (!Is.undefined(itemId)) {
			item = await nftResolve(itemId);
			metadata = item?.metadata;
		}
		busy = false;
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	<ValidatedForm
		title={$i18n('pages.nftProperties.transferTitle')}
		actionButtonLabel={$i18n('pages.nftProperties.transfer')}
		actionSuccessLabel={$i18n('pages.nftProperties.transferSuccess')}
		validationMethod={validate}
		actionMethod={action}
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
</section>
