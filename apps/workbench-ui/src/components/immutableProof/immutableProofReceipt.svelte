<script lang="ts">
	import { Is } from '@twin.org/core';
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import { Button, Card, Heading, Icons, Label, Span, i18n } from '@twin.org/ui-components-svelte';
	import { createExplorerOutputUrl } from '$stores/iota';

	export let item: IJsonLdNodeObject;

	let exploreUrl: string | undefined;

	if (item.type === 'ImmutableStorageIotaReceipt' && Is.stringValue(item.transactionId)) {
		exploreUrl = createExplorerOutputUrl(item.transactionId, 0);
	}

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-col justify-between gap-5">
		<Heading tag="h5">{$i18n('components.immutableProofReceipt.title')}</Heading>
		<div class="flex flex-col gap-4">
			<Label>
				{$i18n('components.immutableProofReceipt.type')}
				<Span>{item.type}</Span>
			</Label>
			{#if item.type === 'ImmutableStorageIotaReceipt'}
				<Label>
					{$i18n('components.immutableProofReceipt.network')}
					<Span>{item.network}</Span>
				</Label>
				<Label>
					{$i18n('components.immutableProofReceipt.transactionId')}
					<Span>{item.transactionId}</Span>
				</Label>
				{#if Is.stringValue(exploreUrl)}
					<div>
						<Button size="xs" on:click={openExplorer} color="plain" class="gap-2"
							>{$i18n(
								'components.immutableProofReceipt.exploreTransaction'
							)}<Icons.CloudArrowUpOutline size="sm" /></Button
						>
					</div>
				{/if}
			{:else if item.type === 'ImmutableStorageEntityStorageReceipt'}
				<Label>
					{$i18n('components.immutableProofReceipt.entityStorageId')}
					<Span>{item.entityStorageId}</Span>
				</Label>
			{/if}
		</div>
	</div>
</Card>
