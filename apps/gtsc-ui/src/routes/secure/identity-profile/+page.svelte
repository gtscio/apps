<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, Validation, type IValidationFailure } from '@gtsc/core';
	import { PropertyHelper } from '@gtsc/schema';
	import { Input, Label } from 'flowbite-svelte';
	import ValidatedForm from '../../../components/validatedForm.svelte';
	import ValidationError from '../../../components/validationError.svelte';
	import { i18n } from '../../../stores/i18n';
	import { profileProperties, profileUpdate } from '../../../stores/profile';

	let firstName = PropertyHelper.getText($profileProperties, 'firstName') ?? '';
	let lastName = PropertyHelper.getText($profileProperties, 'lastName') ?? '';
	let validationErrors: { [field in 'firstName' | 'lastName']?: IValidationFailure[] | undefined } =
		{};
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
	}

	async function action(): Promise<string | undefined> {
		return profileUpdate(firstName, lastName);
	}
</script>

<section class="flex justify-center">
	<ValidatedForm
		titleResource="pages.identityProfile.title"
		validationMethod={validate}
		actionMethod={action}
		bind:validationErrors
		bind:isBusy
	>
		<svelte:fragment slot="fields">
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
		</svelte:fragment>
	</ValidatedForm>
</section>
