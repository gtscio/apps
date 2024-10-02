<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Is, Validation, type IValidationFailure } from '@twin.org/core';
	import {
		i18n,
		Input,
		Label,
		Link,
		P,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { isAuthenticated, login } from '$stores/authentication';

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
				<Label class="flex flex-col gap-2">
					{$i18n('pages.login.email')}
					<Input
						type="email"
						name="email"
						autocomplete="email"
						placeholder="name@example.com"
						bind:value={email}
						color={Is.arrayValue(validationErrors.email) ? 'red' : 'base'}
						disabled={isBusy}
						spellcheck="false"
					/>
					<ValidationError validationErrors={validationErrors.email} />
				</Label>
				<Label class="flex flex-col gap-2">
					{$i18n('pages.login.password')}
					<Input
						type="password"
						name="password"
						placeholder="•••••"
						bind:value={password}
						color={Is.arrayValue(validationErrors.password) ? 'red' : 'base'}
						disabled={isBusy}
						spellcheck="false"
					/>
					<ValidationError validationErrors={validationErrors.password} />
				</Label>
			</svelte:fragment>
			<svelte:fragment slot="after-action">
				<P class="text-sm text-neutral-900 dark:text-neutral-400">
					{$i18n('pages.login.noAccount')}
					<Link href="/authentication/signup" class="ml-2 p-1">{$i18n('pages.login.signUp')}</Link>
				</P>
			</svelte:fragment>
		</ValidatedForm>
	</section>
{/if}
