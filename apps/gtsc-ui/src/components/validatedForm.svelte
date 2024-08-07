<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, Validation, type IValidationFailure } from '@gtsc/core';
	import { Button, Card, Spinner } from 'flowbite-svelte';
	import { i18n } from '../stores/i18n';

	export let titleResource: string;
	export let actionButtonResource: string = 'actions.save';
	export let actionButtonBusyResource: string = 'actions.saving';
	export let actionSuccessResource: string = 'actions.saveSuccess';
	export let validationMethod:
		| ((validationFailures: IValidationFailure[]) => Promise<void>)
		| undefined;
	export let actionMethod: (() => Promise<string | undefined>) | undefined;
	export let validationErrors: { [id: string]: IValidationFailure[] | undefined };
	export let isBusy: boolean = false;

	let submitResult: string | undefined = '';
	let submitResultIsError: boolean = false;
	let submitResultTimeout: number | undefined;

	async function handleSubmit(): Promise<void> {
		submitResult = '';
		submitResultIsError = false;
		window.clearTimeout(submitResultTimeout);

		if (Is.function(validationMethod)) {
			const validationFailures: IValidationFailure[] = [];
			const newErrors: { [id: string]: IValidationFailure[] } = {};
			await validationMethod(validationFailures);
			Validation.toPropertyMap(validationFailures, newErrors);
			validationErrors = newErrors;
		}

		if (Object.keys(validationErrors).length === 0 && Is.function(actionMethod)) {
			isBusy = true;
			const timeStart = Date.now();
			submitResult = await actionMethod();
			submitResultIsError = Is.stringValue(submitResult);

			// If the operation is fast, show the spinner for at least 1 second
			if (Date.now() - timeStart > 1000) {
				await showResult();
			} else {
				setTimeout(showResult, 1000);
			}
		}
	}

	async function showResult(): Promise<void> {
		isBusy = false;
		if (!submitResultIsError && Is.stringValue(actionSuccessResource)) {
			submitResult = $i18n(actionSuccessResource);
		}
		submitResultTimeout = window.setTimeout(() => {
			submitResult = '';
		}, 5000);
	}
</script>

<Card>
	<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
		<form class="flex flex-col space-y-6">
			<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">
				{$i18n(titleResource)}
			</h3>
			<slot name="fields"></slot>
			{#if isBusy}
				<Button type="button" class="w-full gap-2" disabled
					>{$i18n(actionButtonBusyResource)}
					<Spinner size={5} color="white" />
				</Button>
			{:else}
				<Button type="button" class="w-full" on:click={async () => handleSubmit()}
					>{$i18n(actionButtonResource)}
				</Button>
			{/if}
			<slot name="after-action"></slot>
			{#if Is.notEmpty(submitResult)}
				<p
					class={`whitespace-pre-line text-sm ${submitResultIsError ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}
				>
					{submitResult}
				</p>
			{/if}
			<slot name="after-result"></slot>
		</form>
	</div>
</Card>
