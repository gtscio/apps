<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, Urn, Validation, type IValidationFailure } from '@gtsc/core';
	import { PropertyHelper } from '@gtsc/schema';
	import { CloudArrowUpOutline } from 'flowbite-svelte-icons';
	import LabelledValue from '$components/labelledValue.svelte';
	import ValidatedForm from '$components/validatedForm.svelte';
	import ValidationError from '$components/validationError.svelte';
	import { createPublicUrl } from '$stores/app';
	import { i18n } from '$stores/i18n';
	import { profileIdentity, profileProperties, profileUpdate } from '$stores/identityProfile';
	import { createExplorerIdentityUrl } from '$stores/iota';
	import { Button, Helper, Input, Label, QR } from '$ui/components';

	let firstName = PropertyHelper.getText($profileProperties, 'firstName') ?? '';
	let lastName = PropertyHelper.getText($profileProperties, 'lastName') ?? '';
	let displayName = PropertyHelper.getText($profileProperties, 'displayName') ?? '';
	let validationErrors: {
		[field in 'firstName' | 'lastName' | 'displayName']?: IValidationFailure[] | undefined;
	} = {};
	let exploreUrl: string | undefined;

	let isBusy = false;

	const urn = Urn.fromValidString($profileIdentity);
	if (urn.namespaceMethod() === 'iota') {
		exploreUrl = createExplorerIdentityUrl($profileIdentity);
	}

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

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
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
			<div class="flex flex-row gap-5">
				<div class="flex flex-col gap-5">
					<Label class="flex flex-col gap-2">
						{$i18n('pages.identityProfile.identity')}
						<LabelledValue>{$profileIdentity}</LabelledValue>
					</Label>
					{#if Is.stringValue(exploreUrl)}
						<Label>
							<Button size="xs" on:click={openExplorer} class="gap-2"
								>{$i18n('pages.identityPublic.explore')}<CloudArrowUpOutline size="sm" /></Button
							>
						</Label>
					{/if}
				</div>
				<Label class="flex flex-col gap-2">
					{$i18n('pages.identityProfile.qr')}
					<QR
						qrData={createPublicUrl(`identity/${$profileIdentity}`)}
						labelResource="pages.identityProfile.qr"
						dimensions={128}
					/>
				</Label>
			</div>
			<Label class="flex flex-col gap-2">
				{$i18n('pages.identityProfile.firstName')}
				<Input
					type="text"
					name="firstName"
					color={Is.arrayValue(validationErrors.firstName) ? 'red' : 'base'}
					bind:value={firstName}
					disabled={isBusy}
				/>
				<ValidationError validationErrors={validationErrors.firstName} />
			</Label>
			<Label class="flex flex-col gap-2">
				{$i18n('pages.identityProfile.lastName')}
				<Input
					type="text"
					name="lastName"
					color={Is.arrayValue(validationErrors.lastName) ? 'red' : 'base'}
					bind:value={lastName}
					disabled={isBusy}
				/>
				<ValidationError validationErrors={validationErrors.lastName} />
			</Label>
			<Label class="flex flex-col gap-2">
				{$i18n('pages.identityProfile.displayName')}
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
