<script lang="ts">
	import { Is, Validation, type IValidationFailure } from '@gtsc/core';
	import { PropertyHelper } from '@gtsc/schema';
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	import ValidationError from '../../../components/validationError.svelte';
	import { i18n } from '../../../stores/i18n';
	import { profileProperties, profileUpdate } from '../../../stores/profile';

	let firstName = PropertyHelper.getText($profileProperties, 'firstName') ?? '';
	let lastName = PropertyHelper.getText($profileProperties, 'lastName') ?? '';
	let submitResult: string | undefined = '';
	let submitResultIsError: boolean = false;
	let validationErrors: {
		[id: string]: string;
	} = {};

	async function handleSubmit() {
		submitResult = '';
		submitResultIsError = false;

		const validationFailures: IValidationFailure[] = [];
		Validation.stringValue('firstName', firstName, validationFailures);
		Validation.stringValue('lastName', lastName, validationFailures);
		validationErrors = Validation.toPropertyMap(validationFailures);

		if (validationFailures.length === 0) {
			submitResult = await profileUpdate(firstName, lastName);
			submitResultIsError = Is.stringValue(submitResult);
			if (!submitResultIsError) {
				submitResult = $i18n('actions.saveSuccess');
				setTimeout(() => {
					submitResult = '';
				}, 6000);
			}
		}
	}
</script>

<Section name="login">
	<Card>
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
			<form class="flex flex-col space-y-6">
				<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">
					{$i18n('pages.identityProfile.title')}
				</h3>
				<Label class="space-y-2">
					<span>{$i18n('pages.identityProfile.firstName')}</span>
					<Input
						type="text"
						name="firstName"
						color={Is.stringValue(validationErrors[firstName]) ? 'red' : 'base'}
						bind:value={firstName}
					/>
					<ValidationError {validationErrors} property="firstName" />
				</Label>
				<Label class="space-y-2">
					<span>{$i18n('pages.identityProfile.lastName')}</span>
					<Input
						type="text"
						name="lastName"
						color={Is.stringValue(validationErrors[firstName]) ? 'red' : 'base'}
						bind:value={lastName}
					/>
					<ValidationError {validationErrors} property="lastName" />
				</Label>
				<Button type="button" class="w-full1" on:click={() => handleSubmit()}
					>{$i18n('actions.save')}</Button
				>
				<p
					class={`whitespace-pre-line text-sm ${submitResultIsError ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}
				>
					{submitResult}
				</p>
			</form>
		</div>
	</Card>
</Section>
