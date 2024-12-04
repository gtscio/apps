<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type { IAuditableItemStream } from '@twin.org/auditable-item-stream-models';
	import { Is } from '@twin.org/core';
	import {
		type IImmutableProofEventBusProofCreated,
		ImmutableProofTopics
	} from '@twin.org/immutable-proof-models';
	import {
		Button,
		Card,
		Code,
		Error,
		Heading,
		Label,
		P,
		QR,
		Span,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onDestroy, onMount } from 'svelte';
	import ImmutableProofView from '$components/immutableProof/immutableProofView.svelte';
	import { createPrivateUrl } from '$stores/app';
	import { auditableItemStreamGet } from '$stores/auditableItemStreams';
	import { eventBusSubscribe, eventBusUnsubscribe } from '$stores/eventBus';

	export let itemId: string;
	export let returnUrl: string | undefined = undefined;
	let error: string;
	let busy = true;
	let item: IAuditableItemStream | undefined;
	let subscriptionId: string | undefined;

	async function loadStream(): Promise<void> {
		error = '';
		const resultVerify = await auditableItemStreamGet(itemId);
		if (Is.stringValue(resultVerify?.error)) {
			error = resultVerify.error;
		} else {
			item = resultVerify?.item;
		}
		busy = false;
	}

	onMount(async () => {
		await loadStream();

		if (item?.verification?.verified === false) {
			const result = await eventBusSubscribe<IImmutableProofEventBusProofCreated>(
				ImmutableProofTopics.ProofCreated,
				async event => {
					if (event.data.id === item?.proofId) {
						if (Is.stringValue(subscriptionId)) {
							await eventBusUnsubscribe(subscriptionId);
							subscriptionId = undefined;
						}

						await loadStream();
					}
				}
			);

			if (Is.stringValue(result?.error)) {
				error = result.error;
			} else {
				subscriptionId = result?.subscriptionId;
			}
		}
	});

	onDestroy(async () => {
		if (Is.stringValue(subscriptionId)) {
			await eventBusUnsubscribe(subscriptionId);
		}
	});
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('components.auditableItemStreamView.title')}</Heading>
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
						{$i18n('components.auditableItemStreamView.id')}
						<Span>{itemId}</Span>
					</Label>
				</div>
				<QR
					qrData={createPrivateUrl(`auditable-item-stream/${itemId}`)}
					label={$i18n('components.auditableItemStreamView.auditableItemStreamQr')}
					dimensions={128}
				/>
			</div>
			{#if Is.object(item)}
				<Code>{JSON.stringify(item, null, 2)}</Code>
				{#if Is.stringValue(item.proofId) && Is.empty(item.verification?.failure)}
					<ImmutableProofView itemId={item.proofId} />
				{:else}
					<div class="flex flex-row gap-5">
						<Spinner />
						<P>Waiting for Proof creation...</P>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
	{#if Is.stringValue(returnUrl)}
		<div class="flex flex-row gap-2">
			<Button on:click={() => goto(returnUrl)}>{$i18n('actions.back')}</Button>
		</div>
	{/if}
</Card>
