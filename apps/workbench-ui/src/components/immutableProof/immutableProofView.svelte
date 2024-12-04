<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is } from '@twin.org/core';
	import type { IImmutableProof } from '@twin.org/immutable-proof-models';
	import {
		Card,
		Code,
		Error,
		Heading,
		Label,
		Span,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import ImmutableProofReceipt from './immutableProofReceipt.svelte';
	import { immutableProofGet } from '$stores/immutableProof';

	export let itemId: string;
	let error: string;
	let busy = true;
	let immutableProof: IImmutableProof | undefined;

	onMount(async () => {
		error = '';
		const result = await immutableProofGet(itemId);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else {
			immutableProof = result?.item;
		}
		busy = false;
	});
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('components.immutableProofView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	<Error {error} />
	{#if !busy}
		<div class="flex flex-row justify-between gap-5">
			<div class="flex flex-col gap-4 overflow-hidden">
				<Label>
					{$i18n('components.immutableProofView.id')}
					<Span>{itemId}</Span>
				</Label>
				{#if !Is.empty(immutableProof)}
					<Label>
						{$i18n('components.immutableProofView.proof')}
						<Code>{JSON.stringify(immutableProof, null, 2)}</Code>
					</Label>
				{/if}
				{#if !Is.empty(immutableProof?.immutableReceipt)}
					<ImmutableProofReceipt item={immutableProof.immutableReceipt} />
				{/if}
			</div>
		</div>
	{/if}
</Card>
