<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Is } from '@gtsc/core';
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	import { authenticationError, isAuthenticated, login } from '../../../stores/authentication';
	import { i18n } from '../../../stores/i18n';

	const returnUrl = $page.url.searchParams.get('returnUrl') ?? '/secure/dashboard';
	let emailAddress = '';
	let password = '';

	isAuthenticated.subscribe((value) => {
		if (value) {
			// This will get triggered on a successful login
			goto(returnUrl);
		}
	});

	async function handleLogin() {
		await login(emailAddress, password);
	}
</script>

{#if !$isAuthenticated}
	<Section name="login">
		<Card>
			<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
				<form class="flex flex-col space-y-6">
					<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">
						{$i18n('pages.login.title')}
					</h3>
					<Label class="space-y-2">
						<span>{$i18n('pages.login.email')}</span>
						<Input
							type="email"
							name="email"
							placeholder="name@example.com"
							required
							bind:value={emailAddress}
						/>
					</Label>
					<Label class="space-y-2">
						<span>{$i18n('pages.login.password')}</span>
						<Input
							type="password"
							name="password"
							placeholder="•••••"
							required
							bind:value={password}
						/>
					</Label>
					<Button type="button" class="w-full1" on:click={() => handleLogin()}
						>{$i18n('pages.login.signIn')}</Button
					>
					{#if Is.stringValue($authenticationError)}
						<p class="whitespace-pre-line text-sm text-red-500 dark:text-red-400">
							{$authenticationError}
						</p>
					{/if}
					<p class="text-sm font-light text-gray-500 dark:text-gray-400">
						{$i18n('pages.login.noAccount')}
						<a
							href="/authentication/signup"
							class="text-primary-600 dark:text-primary-500 font-medium hover:underline"
							>{$i18n('pages.login.signUp')}</a
						>
					</p>
				</form>
			</div>
		</Card>
	</Section>
{/if}
