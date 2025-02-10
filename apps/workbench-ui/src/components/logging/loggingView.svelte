<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import type {	ILogEntry } from '@twin.org/logging-models';
	import {
		Card,
		Error,
		Heading,
		Label,
		Span,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { loggingResolve } from '$stores/logging';

	let error: string;
	let busy = true;
	let items:
		| Partial<{
			entities?: ILogEntry[];
			cursor?: string;
				error?: string;
		  }>
		| undefined;

	onMount(async () => {
		error = '';
		items = await loggingResolve();
		// eslint-disable-next-line no-console
		console.log(items);
		busy = false;
	});
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('components.loggingView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	<Error {error} />
	{#if !busy}
		<div class="flex flex-col justify-between gap-4">
			<div class="flex flex-col justify-between gap-4 md:flex-row">
				<div class="flex flex-col gap-4">
					<Label>
						<Span>Logs</Span>
					</Label>
				</div>
			</div>
		</div>
	{/if}
</Card>
