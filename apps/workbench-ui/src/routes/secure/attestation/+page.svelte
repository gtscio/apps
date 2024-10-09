<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Converter, Is, Validation, type IValidationFailure } from '@twin.org/core';
	import { Blake2b } from '@twin.org/crypto';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Card,
		Fileupload,
		Heading,
		i18n,
		Label,
		LabelledValue,
		P,
		QR,
		Select,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import type { IDocumentAttestation } from '$models/IDocumentAttestation';
	import { createPrivateUrl, createPublicUrl } from '$stores/app';
	import { attestationCreate } from '$stores/attestation';
	import { blobStorageUpload } from '$stores/blobStorage';
	import { identityGetPublic } from '$stores/identity';
	import { profileIdentity } from '$stores/identityProfile';

	let filename = '';
	let files: FileList | undefined;
	let validationErrors: {
		[field in 'filename' | 'assertionMethod']?: IValidationFailure[] | undefined;
	} = {};
	let isBusy = false;
	let blobId: string | undefined;
	let signature: string | undefined;
	let progress: string | undefined;
	let assertionMethods: { value: string; name: string }[] = [];
	let assertionMethod: string = '';
	let attestationId: string | undefined;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'filename',
			Is.stringValue(filename) ? filename : undefined,
			validationFailures,
			$i18n('pages.attestation.filename')
		);

		Validation.notEmpty(
			'assertionMethod',
			Is.stringValue(assertionMethod) ? assertionMethod : undefined,
			validationFailures,
			$i18n('pages.attestation.assertionMethod')
		);
	}

	async function action(): Promise<string | undefined> {
		blobId = undefined;
		signature = undefined;
		attestationId = undefined;
		if (!Is.empty(files) && files.length > 0) {
			progress = $i18n('pages.attestation.progressUploading');

			const file = files[0];
			const buffer = await file.arrayBuffer();
			const bytes = new Uint8Array(buffer);
			const attestationObject: IJsonLdNodeObject = {
				'@context': 'https://schema.org',
				'@graph': [
					{
						'@type': 'Thing',
						name: file.name
					}
				]
			};
			const resultBlob = await blobStorageUpload(file.type, attestationObject, bytes);
			if (Is.stringValue(resultBlob?.error)) {
				return resultBlob?.error;
			}
			blobId = resultBlob?.id ?? '';

			signature = `b2b256:${Converter.bytesToBase64(Blake2b.sum256(bytes))}`;

			const data: IDocumentAttestation = {
				'@context': 'https://schema.twindev.org/workbench/',
				type: 'DocumentAttestation',
				blobId,
				signature
			};

			progress = $i18n('pages.attestation.progressAttesting');

			const resultAttestation = await attestationCreate(assertionMethod, data);
			if (Is.stringValue(resultAttestation?.error)) {
				return resultAttestation?.error;
			}
			attestationId = resultAttestation?.attestationId;

			progress = undefined;
		}

		return undefined;
	}

	onMount(async () => {
		isBusy = true;
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
		isBusy = false;
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	<ValidatedForm
		titleResource="pages.attestation.title"
		actionButtonResource="pages.attestation.attest"
		actionButtonBusyResource="pages.attestation.attesting"
		actionSuccessResource="pages.attestation.attestSuccess"
		validationMethod={validate}
		actionMethod={action}
		bind:validationErrors
		bind:isBusy
	>
		<svelte:fragment slot="fields">
			<Label>
				{$i18n('pages.attestation.filename')}
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
			<Label>
				{$i18n('pages.attestation.assertionMethod')}
				<Select
					name="assertionMethod"
					placeholder={$i18n('pages.attestation.selectAssertionMethod')}
					items={assertionMethods}
					color={Is.arrayValue(validationErrors.assertionMethod) ? 'red' : 'base'}
					bind:value={assertionMethod}
					disabled={isBusy}
				></Select>
				<ValidationError validationErrors={validationErrors.assertionMethod} />
			</Label>
		</svelte:fragment>
		<svelte:fragment slot="after-action">
			{#if Is.stringValue(progress)}
				<P>{progress}</P>
			{/if}
		</svelte:fragment>
	</ValidatedForm>
	{#if Is.stringValue(attestationId)}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5">{$i18n('pages.attestation.resultTitle')}</Heading>
			{#if Is.stringValue(blobId)}
				<Label>
					{$i18n('pages.attestation.blobId')}
					<LabelledValue>{blobId}</LabelledValue>
				</Label>
				<Label>
					{$i18n('pages.attestation.blobQr')}
					<QR
						class="mt-2"
						qrData={createPrivateUrl(`blob/${blobId}`)}
						labelResource="pages.attestation.blobQr"
						dimensions={128}
					/>
				</Label>
			{/if}
			{#if Is.stringValue(signature)}
				<Label>
					{$i18n('pages.attestation.signature')}
					<LabelledValue>{signature}</LabelledValue>
				</Label>
			{/if}
			{#if Is.stringValue(attestationId)}
				<Label>
					{$i18n('pages.attestation.attestationId')}
					<LabelledValue>{attestationId}</LabelledValue>
				</Label>
				<Label>
					{$i18n('pages.attestation.attestationQr')}
					<QR
						class="mt-2"
						qrData={createPublicUrl(`attestation/${attestationId}`)}
						labelResource="pages.attestation.attestationQr"
						dimensions={128}
					/>
				</Label>
			{/if}
		</Card>
	{/if}
</section>
