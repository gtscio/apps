<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, Validation, type IValidationFailure } from '@gtsc/core';
	import { Fileupload, Label } from 'flowbite-svelte';
	import Qr from '../../../components/qr.svelte';
	import ValidatedForm from '../../../components/validatedForm.svelte';
	import ValidationError from '../../../components/validationError.svelte';
	import { createPrivateUrl } from '../../../stores/app';
	import { blobStorageUpload } from '../../../stores/blobStorage';
	import { i18n } from '../../../stores/i18n';

	let filename = '';
	let files: FileList | undefined;
	let validationErrors: {
		[field in 'filename']?: IValidationFailure[] | undefined;
	} = {};
	let isBusy = false;
	let blobId: string | undefined;
	let progress: string = '';

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'filename',
			Is.stringValue(filename) ? filename : undefined,
			validationFailures,
			$i18n('pages.attestation.filename')
		);
	}

	async function action(): Promise<string | undefined> {
		progress = $i18n('pages.attestation.uploading');

		if (!Is.empty(files)) {
			const file = files[0];
			if (file) {
				const buffer = await file.arrayBuffer();
				const result = await blobStorageUpload(file.name, file.type, new Uint8Array(buffer));
				if (Is.stringValue(result?.error)) {
					return result?.error;
				}
				blobId = result?.id;
			}
		}

		return undefined;
	}
</script>

<section class="flex justify-center gap-5">
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
			<Label class="space-y-2">
				<span>{$i18n('pages.attestation.filename')}</span>
				<Fileupload
					type="text"
					name="firstName"
					color={Is.arrayValue(validationErrors.filename) ? 'red' : 'base'}
					bind:value={filename}
					bind:files
					disabled={isBusy}
				/>
				<ValidationError validationErrors={validationErrors.filename} />
			</Label>
		</svelte:fragment>
		<svelte:fragment slot="after-action">
			<p>{progress}</p>
			{#if Is.stringValue(blobId)}
				<Qr
					qrData={createPrivateUrl(`blob/${blobId}`)}
					labelResource="pages.identityProfile.qr"
					dimensions={128}
				/>
			{/if}
		</svelte:fragment>
	</ValidatedForm>
</section>
