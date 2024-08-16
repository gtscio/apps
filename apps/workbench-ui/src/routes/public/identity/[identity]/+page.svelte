<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import { Is } from '@gtsc/core';
	import { PropertyHelper } from '@gtsc/schema';
	import type { IDidDocument } from '@gtsc/standards-w3c-did';
	import { Card, Heading, Label, Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import Error from '../../../../components/error.svelte';
	import LabelledValue from '../../../../components/labelledValue.svelte';
	import Qr from '../../../../components/qr.svelte';
	import { createPublicUrl } from '../../../../stores/app';
	import { i18n } from '../../../../stores/i18n';
	import { identityGetPublic } from '../../../../stores/identity';
	import { profileGetPublic } from '../../../../stores/identityProfile';

	const identity = $page.params.identity;
	let displayName: string;
	let error: string;
	let didDocument: IDidDocument | undefined;
	let isBusy = true;

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
		isBusy = false;
	});
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.identityPublic.title')}</Heading>
		{#if isBusy}
			<Spinner size={5} color="white" />
		{/if}
	</div>
	{#if !isBusy}
		<div class="flex flex-row justify-between gap-5">
			<div class="flex flex-col gap-4">
				<Label>
					{$i18n('pages.identityPublic.identity')}
					<LabelledValue>{identity}</LabelledValue>
				</Label>
				<Error {error} />
				{#if Is.string(displayName)}
					<Label>
						{$i18n('pages.identityPublic.displayName')}
						<LabelledValue>{displayName}</LabelledValue>
					</Label>
				{/if}
			</div>
			<Qr
				qrData={createPublicUrl(`identity/${identity}`)}
				labelResource="pages.identityPublic.qr"
				dimensions={128}
			/>
		</div>
		{#if Is.object(didDocument)}
			<Label>
				{$i18n('pages.identityPublic.didDocument')}
				<div class="mt-2 w-full rounded-md border dark:border-gray-700">
					<pre class="w-full overflow-auto p-2 text-xs">{JSON.stringify(
							didDocument,
							undefined,
							2
						)}</pre>
				</div>
			</Label>
		{/if}
	{/if}
</Card>
