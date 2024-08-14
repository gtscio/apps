<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import { Is } from '@gtsc/core';
	import { PropertyHelper } from '@gtsc/schema';
	import type { IDidDocument } from '@gtsc/standards-w3c-did';
	import { Card, Label } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { i18n } from '../../../../stores/i18n';
	import { identityGetPublic } from '../../../../stores/identity';
	import { profileGetPublic } from '../../../../stores/profile';

	const identity = $page.params.identity;
	let displayName: string;
	let error: string;
	let didDocument: IDidDocument | undefined;

	onMount(async () => {
		error = '';
		const result = await profileGetPublic(identity);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else {
			displayName = PropertyHelper.getText(result?.properties, 'displayName') ?? '';
		}

		const result2 = await identityGetPublic(identity);
		if (Is.stringValue(result2?.error)) {
			error += result2.error;
		} else {
			didDocument = result2?.document;
		}
	});
</script>

<Card class="max-w-full gap-4">
	<div>
		<Label>
			{$i18n('pages.identityPublic.identity')}
		</Label>
		<span class="whitespace-pre-wrap break-all">{identity}</span>
	</div>
	{#if Is.stringValue(error)}
		<div color="red">
			{error}
		</div>
	{:else}
		{#if Is.string(displayName)}
			<div>
				<Label>
					{$i18n('pages.identityPublic.displayName')}
				</Label>
				{displayName}
			</div>
		{/if}
		{#if Is.object(didDocument)}
			<div>
				<Label>
					{$i18n('pages.identityPublic.didDocument')}
				</Label>
				<pre class="overflow-auto text-xs">{JSON.stringify(didDocument, undefined, 2)}</pre>
			</div>
		{/if}
	{/if}
</Card>
