<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, ObjectHelper, Urn, Validation, type IValidationFailure } from '@twin.org/core';
	import {
		Button,
		Helper,
		i18n,
		Input,
		Label,
		LabelledValue,
		QR,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { CloudArrowUpOutline } from 'flowbite-svelte-icons';
	import { createPublicUrl } from '$stores/app';
	import {
		privateProfile,
		profileIdentity,
		profileUpdate,
		publicProfile
	} from '$stores/identityProfile';
	import { createExplorerIdentityUrl } from '$stores/iota';

	let firstName = ObjectHelper.propertyGet<string>($privateProfile, 'givenName') ?? '';
	let lastName = ObjectHelper.propertyGet<string>($privateProfile, 'familyName') ?? '';
	let displayName = ObjectHelper.propertyGet<string>($publicProfile, 'name') ?? '';
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
		return profileUpdate({ name: displayName }, { givenName: firstName, familyName: lastName });
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
