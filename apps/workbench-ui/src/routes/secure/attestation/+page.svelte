<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import type { IAttestationInformation } from '@gtsc/attestation-models';
	import { Converter, Is, Validation, type IValidationFailure } from '@gtsc/core';
	import { Blake2b } from '@gtsc/crypto';
	import { onMount } from 'svelte';
	import LabelledValue from '$components/labelledValue.svelte';
	import ValidatedForm from '$components/validatedForm.svelte';
	import ValidationError from '$components/validationError.svelte';
	import type { IDocumentAttestation } from '$models/IDocumentAttestation';
	import { createPrivateUrl, createPublicUrl } from '$stores/app';
	import { attestationAttest } from '$stores/attestation';
	import { blobStorageUpload } from '$stores/blobStorage';
	import { i18n } from '$stores/i18n';
	import { identityGetPublic } from '$stores/identity';
	import { profileIdentity } from '$stores/identityProfile';
	import { Card, Fileupload, Heading, Label, P, QR, Select } from '$ui/components';

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
	let attestationInfo: IAttestationInformation<IDocumentAttestation> | undefined;

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
		attestationInfo = undefined;
		if (!Is.empty(files) && files.length > 0) {
			progress = $i18n('pages.attestation.progressUploading');

			const file = files[0];
			const buffer = await file.arrayBuffer();
			const bytes = new Uint8Array(buffer);
			const resultBlob = await blobStorageUpload(file.name, file.type, bytes);
			if (Is.stringValue(resultBlob?.error)) {
				return resultBlob?.error;
			}
			blobId = resultBlob?.id ?? '';

			signature = `b2b256:${Converter.bytesToBase64(Blake2b.sum256(bytes))}`;

			const data: IDocumentAttestation = {
				blobId,
				signature
			};

			progress = $i18n('pages.attestation.progressAttesting');

			const resultAttestation = await attestationAttest(assertionMethod, data);
			if (Is.stringValue(resultAttestation?.error)) {
				return resultAttestation?.error;
			}
			attestationInfo = resultAttestation?.info;

			progress = undefined;
		}

		return undefined;
	}

	onMount(async () => {
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
			<Label class="flex flex-col gap-2">
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
			<Label class="flex flex-col gap-2">
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
	{#if Is.stringValue(attestationInfo?.id)}
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
			{#if Is.stringValue(attestationInfo?.id)}
				<Label>
					{$i18n('pages.attestation.attestationId')}
					<LabelledValue>{attestationInfo?.id}</LabelledValue>
				</Label>
				<Label>
					{$i18n('pages.attestation.attestationQr')}
					<QR
						class="mt-2"
						qrData={createPublicUrl(`attestation/${attestationInfo?.id}`)}
						labelResource="pages.attestation.attestationQr"
						dimensions={128}
					/>
				</Label>
			{/if}
		</Card>
	{/if}
</section>
