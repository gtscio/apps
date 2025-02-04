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
	import { identityResolve } from '$stores/identityResolver';
	import { nftMint } from '$stores/nft';
	import { nftsEntryCreate } from '$stores/nfts';

	export let returnUrl: string;
	let validationErrors: {
		[field in 'issuer' | 'tag']?: IValidationFailure[] | undefined;
	} = {};
	let busy = false;
	let signature: string | undefined;
	let progress: string | undefined;
	let itemId: string | undefined;
	let issuer: string | undefined = '';
	let tag: string | undefined = '';
	let name: string | undefined = '';
	let description: string | undefined = '';
	let uri: string | undefined = '';

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

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		signature = undefined;
		itemId = undefined;

		if (Is.stringValue(issuer) && Is.stringValue(tag)) {
			progress = $i18n('pages.nftProperties.progress');
			let immutableMetadata: { [key: string]: unknown } | undefined = undefined;
			if (Is.stringValue(name) || Is.stringValue(description) || Is.stringValue(uri)) {
				immutableMetadata = {};
				immutableMetadata.name = name ?? '';
				immutableMetadata.description = description ?? '';
				immutableMetadata.uri = uri ?? '';
			}

			const result = await nftMint(issuer, tag, immutableMetadata);
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

	onMount(async () => {
		busy = true;
		const identityInfo = await identityResolve($profileIdentity);
		issuer = identityInfo?.document?.id;
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
