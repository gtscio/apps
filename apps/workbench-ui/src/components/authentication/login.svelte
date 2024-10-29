<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
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
	import { login } from '$stores/authentication';

	let email = '';
	let password = '';
	let validationErrors: { [field in 'email' | 'password']?: IValidationFailure[] | undefined } = {};
	let busy = false;

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.email('email', email, validationFailures, $i18n('pages.login.email'));
		Validation.stringValue('password', password, validationFailures, $i18n('pages.login.password'));
	}

	async function action(): Promise<string | undefined> {
		return login(email, password);
	}
</script>

<section class="flex w-full justify-center">
	<ValidatedForm
		title={$i18n('pages.login.title')}
		actionButtonLabel={$i18n('pages.login.signIn')}
		validationMethod={validate}
		actionMethod={action}
		actionSuccessLabel=""
		bind:validationErrors
		bind:busy
	>
		{#snippet fields()}
			<Label class="flex flex-col gap-2">
				{$i18n('pages.login.email')}
				<Input
					type="email"
					name="email"
					autocomplete="email"
					placeholder="name@example.com"
					bind:value={email}
					color={Is.arrayValue(validationErrors.email) ? 'error' : 'default'}
					disabled={busy}
					spellcheck={false}
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
					color={Is.arrayValue(validationErrors.password) ? 'error' : 'default'}
					disabled={busy}
					spellcheck={false}
				/>
				<ValidationError validationErrors={validationErrors.password} />
			</Label>
		{/snippet}
		{#snippet afterAction()}
			<P class="text-sm text-neutral-900 dark:text-neutral-400">
				{$i18n('pages.login.noAccount')}
				<Link href="/authentication/signup" class="ml-2 p-1">{$i18n('pages.login.signUp')}</Link>
			</P>
		{/snippet}
	</ValidatedForm>
</section>
