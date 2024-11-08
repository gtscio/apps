<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Converter, Is, ObjectHelper, Validation, type IValidationFailure } from '@twin.org/core';
	import { Blake2b } from '@twin.org/crypto';
	import {
		Button,
		Card,
		Heading,
		i18n,
		Label,
		P,
		QR,
		Select,
		Span,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import type { IDocumentAttestation } from '$models/IDocumentAttestation';
	import { createPublicUrl } from '$stores/app';
	import { attestationCreate } from '$stores/attestation';
	import { attestationsEntryCreate } from '$stores/attestations';
	import { blobStorageGet, blobStorageList } from '$stores/blobStorage';
	import { identityGetPublic } from '$stores/identity';
	import { profileIdentity } from '$stores/identityProfile';

	export let returnUrl: string;
	let validationErrors: {
		[field in 'blobId' | 'assertionMethod']?: IValidationFailure[] | undefined;
	} = {};
	let busy = false;
	let signature: string | undefined;
	let progress: string | undefined;
	let itemId: string | undefined;
	let assertionMethods: { value: string; name: string }[] = [];
	let assertionMethod: string = '';
	let blobNames: { value: string; name: string }[] = [];
	let blobId: string | undefined;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'blobId',
			Is.stringValue(assertionMethod) ? assertionMethod : undefined,
			validationFailures,
			$i18n('pages.attestationProperties.blob')
		);

		Validation.notEmpty(
			'assertionMethod',
			Is.stringValue(assertionMethod) ? assertionMethod : undefined,
			validationFailures,
			$i18n('pages.attestationProperties.assertionMethod')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		signature = undefined;
		itemId = undefined;

		if (Is.stringValue(blobId)) {
			progress = $i18n('pages.attestationProperties.progress');

			const resultBlob = await blobStorageGet(blobId, true);
			if (Is.stringValue(resultBlob?.error)) {
				return resultBlob?.error;
			}

			const bytes = Converter.base64ToBytes(resultBlob?.data?.blob ?? '');
			signature = `b2b256:${Converter.bytesToBase64(Blake2b.sum256(bytes))}`;

			const blobDescription = resultBlob?.data?.metadata?.name ?? 'file';

			const data: IDocumentAttestation = {
				'@context': 'https://schema.twindev.org/workbench/',
				type: 'DocumentAttestation',
				blobId,
				signature
			};

			const result = await attestationCreate(assertionMethod, data);
			progress = '';

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}

			itemId = result?.attestationId;

			if (Is.stringValue(itemId)) {
				await attestationsEntryCreate({
					id: itemId,
					description: $i18n('pages.attestationProperties.attestationOf', {
						blob: blobDescription
					}),
					dateCreated: new Date().toISOString()
				});
			}
		}

		return undefined;
	}

	onMount(async () => {
		busy = true;
		const identity = await identityGetPublic($profileIdentity);

		assertionMethods =
			identity?.document?.assertionMethod?.map(am => {
				const full = Is.stringValue(am) ? am : am.id;
				const fullParts = full.split('#');
				const hashLength = fullParts[1].length;
				return {
					value: full,
					name:
						fullParts.length > 1
							? `...${fullParts[0].slice(-(30 - hashLength))}#${fullParts[1]}`
							: full
				};
			}) ?? [];
		if (assertionMethods.length > 0) {
			assertionMethod = assertionMethods[0].value;
		}

		const blobsFirstPage = await blobStorageList();
		blobNames =
			blobsFirstPage?.items?.map(blob => ({
				value: blob.id,
				name: ObjectHelper.propertyGet(blob, 'metadata.name') ?? blob.id
			})) ?? [];
		if (blobNames.length > 0) {
			blobId = blobNames[0].value;
		}
		busy = false;
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !Is.stringValue(itemId)}
		<ValidatedForm
			title={$i18n('pages.attestationProperties.title')}
			actionButtonLabel={$i18n('pages.attestationProperties.action')}
			actionSuccessLabel={$i18n('pages.attestationProperties.actionSuccess')}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.attestationProperties.blob')}
					<Select
						name="blob"
						placeholder={$i18n('pages.attestationProperties.selectBlob')}
						items={blobNames}
						color={Is.arrayValue(validationErrors.blobId) ? 'error' : 'default'}
						bind:value={blobId}
						disabled={busy}
					></Select>
					<ValidationError validationErrors={validationErrors.assertionMethod} />
				</Label>
				<Label>
					{$i18n('pages.attestationProperties.assertionMethod')}
					<Select
						name="assertionMethod"
						placeholder={$i18n('pages.attestationProperties.selectAssertionMethod')}
						items={assertionMethods}
						color={Is.arrayValue(validationErrors.assertionMethod) ? 'error' : 'default'}
						bind:value={assertionMethod}
						disabled={busy}
					></Select>
					<ValidationError validationErrors={validationErrors.assertionMethod} />
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
			<Heading tag="h5">{$i18n('pages.attestationProperties.resultTitle')}</Heading>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.attestationProperties.attestationId')}
					<Span>{itemId}</Span>
				</Label>
				<Label>
					{$i18n('pages.attestationProperties.attestationQr')}
					<QR
						class="mt-2"
						qrData={createPublicUrl(`attestation/${itemId}`)}
						href={createPublicUrl(`attestation/${itemId}`)}
						label={$i18n('pages.attestationProperties.attestationQr')}
						dimensions={128}
					/>
				</Label>
			{/if}
			{#if Is.stringValue(signature)}
				<Label>
					{$i18n('pages.attestationProperties.signature')}
					<Span>{signature}</Span>
				</Label>
			{/if}
			<Button on:click={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
