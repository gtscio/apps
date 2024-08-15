<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Is, Validation, type IValidationFailure } from '@gtsc/core';
	import { Input, Label } from 'flowbite-svelte';
	import ValidatedForm from '../components/validatedForm.svelte';
	import ValidationError from '../components/validationError.svelte';
	import { isAuthenticated, login } from '../stores/authentication';
	import { i18n } from '../stores/i18n';

	let email = '';
	let password = '';
	let validationErrors: { [field in 'email' | 'password']?: IValidationFailure[] | undefined } = {};
	let isBusy = false;

	isAuthenticated.subscribe(value => {
		if (value) {
			// This will get triggered on a successful login
			goto($page.url.searchParams.get('returnUrl') ?? '/secure/dashboard');
		}
	});

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.email('email', email, validationFailures, $i18n('pages.login.email'));
		Validation.stringValue('password', password, validationFailures, $i18n('pages.login.password'));
	}

	async function action(): Promise<string | undefined> {
		return login(email, password);
	}
</script>

{#if !$isAuthenticated || true}
	<section class="flex w-full justify-center">
		<ValidatedForm
			titleResource="pages.login.title"
			actionButtonResource="pages.login.signIn"
			actionButtonBusyResource="pages.login.signingIn"
			validationMethod={validate}
			actionMethod={action}
			actionSuccessResource=""
			bind:validationErrors
			bind:isBusy
		>
			<svelte:fragment slot="fields">
				<Label class="space-y-2">
					<span>{$i18n('pages.login.email')}</span>
					<Input
						type="email"
						name="email"
						placeholder="name@example.com"
						bind:value={email}
						color={Is.arrayValue(validationErrors.email) ? 'red' : 'base'}
						disabled={isBusy}
					/>
					<ValidationError validationErrors={validationErrors.email} />
				</Label>
				<Label class="space-y-2">
					<span>{$i18n('pages.login.password')}</span>
					<Input
						type="password"
						name="password"
						placeholder="•••••"
						bind:value={password}
						color={Is.arrayValue(validationErrors.password) ? 'red' : 'base'}
						disabled={isBusy}
					/>
					<ValidationError validationErrors={validationErrors.password} />
				</Label>
			</svelte:fragment>
			<svelte:fragment slot="after-action">
				<p class="text-sm font-light text-gray-500 dark:text-gray-400">
					{$i18n('pages.login.noAccount')}
					<a
						href="/authentication/signup"
						class="text-primary-600 dark:text-primary-500 font-medium hover:underline"
						>{$i18n('pages.login.signUp')}</a
					>
				</p>
			</svelte:fragment>
		</ValidatedForm>
	</section>
{/if}
