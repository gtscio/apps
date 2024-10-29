<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type { IAuditableItemStream } from '@twin.org/auditable-item-stream-models';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Card,
		Code,
		Error,
		Heading,
		Label,
		QR,
		Span,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { createPrivateUrl } from '$stores/app';
	import { auditableItemStreamGet } from '$stores/auditableItemStreams';

	export let itemId: string;
	export let returnUrl: string | undefined = undefined;
	let error: string;
	let busy = true;
	let item: IAuditableItemStream | undefined;

	onMount(async () => {
		error = '';
		const resultVerify = await auditableItemStreamGet(itemId);
		if (Is.stringValue(resultVerify?.error)) {
			error = resultVerify.error;
		} else {
			item = resultVerify?.item;
		}
		busy = false;
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
			{/if}
		</div>
	{/if}
	{#if Is.stringValue(returnUrl)}
		<div class="flex flex-row gap-2">
			<Button on:click={() => goto(returnUrl)}>{$i18n('actions.back')}</Button>
		</div>
	{/if}
</Card>
