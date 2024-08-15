<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, Validation, type IValidationFailure } from '@gtsc/core';
	import { PropertyHelper } from '@gtsc/schema';
	import { Helper, Input, Label } from 'flowbite-svelte';
	import Qr from '../../../components/qr.svelte';
	import ValidatedForm from '../../../components/validatedForm.svelte';
	import ValidationError from '../../../components/validationError.svelte';
	import { createPublicUrl } from '../../../stores/app';
	import { i18n } from '../../../stores/i18n';
	import { profileIdentity, profileProperties, profileUpdate } from '../../../stores/profile';

	let firstName = PropertyHelper.getText($profileProperties, 'firstName') ?? '';
	let lastName = PropertyHelper.getText($profileProperties, 'lastName') ?? '';
	let displayName = PropertyHelper.getText($profileProperties, 'displayName') ?? '';
	let validationErrors: {
		[field in 'firstName' | 'lastName' | 'displayName']?: IValidationFailure[] | undefined;
	} = {};
	let isBusy = false;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.stringValue(
			'firstName',
			firstName,
			validationFailures,
			$i18n('pages.identityProfile.firstName')
		);
		Validation.stringValue(
			'lastName',
			lastName,
			validationFailures,
			$i18n('pages.identityProfile.lastName')
		);
		Validation.stringValue(
			'displayName',
			displayName,
			validationFailures,
			$i18n('pages.identityProfile.displayName')
		);
	}

	async function action(): Promise<string | undefined> {
		return profileUpdate({ firstName, lastName, displayName });
	}
</script>

<section class="flex justify-center gap-5">
	<ValidatedForm
		titleResource="pages.identityProfile.title"
		validationMethod={validate}
		actionMethod={action}
		bind:validationErrors
		bind:isBusy
	>
		<svelte:fragment slot="fields">
			<Label class="flex flex-col space-y-2">
				<span>{$i18n('pages.identityProfile.qr')}</span>
				<Qr
					qrData={createPublicUrl(`identity/${$profileIdentity}`)}
					labelResource="pages.identityProfile.qr"
					dimensions={128}
				/>
			</Label>
			<Label class="space-y-2">
				<span>{$i18n('pages.identityProfile.firstName')}</span>
				<Input
					type="text"
					name="firstName"
					color={Is.arrayValue(validationErrors.firstName) ? 'red' : 'base'}
					bind:value={firstName}
					disabled={isBusy}
				/>
				<ValidationError validationErrors={validationErrors.firstName} />
			</Label>
			<Label class="space-y-2">
				<span>{$i18n('pages.identityProfile.lastName')}</span>
				<Input
					type="text"
					name="lastName"
					color={Is.arrayValue(validationErrors.lastName) ? 'red' : 'base'}
					bind:value={lastName}
					disabled={isBusy}
				/>
				<ValidationError validationErrors={validationErrors.lastName} />
			</Label>
			<Label class="space-y-2">
				<span>{$i18n('pages.identityProfile.displayName')}</span>
				<Helper>{$i18n('pages.identityProfile.displayNameDescription')}</Helper>
				<Input
					type="text"
					name="displayName"
					color={Is.arrayValue(validationErrors.lastName) ? 'red' : 'base'}
					bind:value={displayName}
					disabled={isBusy}
				/>
				<ValidationError validationErrors={validationErrors.displayName} />
			</Label>
		</svelte:fragment>
	</ValidatedForm>
</section>
