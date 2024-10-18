<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type { IAttestationInformation } from '@twin.org/attestation-models';
	import { Is, Urn } from '@twin.org/core';
	import {
		Button,
		Card,
		Code,
		Error,
		Heading,
		Label,
		LabelledValue,
		QR,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { CloudArrowUpOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { createPublicUrl } from '$stores/app';
	import { attestationGet } from '$stores/attestation';
	import { attestationIdToNftId, createExplorerNftUrl } from '$stores/iota';

	export let itemId: string;
	export let returnUrl: string | undefined = undefined;
	let error: string;
	let busy = true;
	let item: Partial<IAttestationInformation> | undefined;
	let exploreUrl: string | undefined;

	onMount(async () => {
		error = '';
		const resultVerify = await attestationGet(itemId);
		if (Is.stringValue(resultVerify?.error)) {
			error = resultVerify.error;
		} else {
			item = resultVerify?.item;
			if (Is.stringValue(item?.id)) {
				const nftId = attestationIdToNftId(item.id);

				const urn = Urn.fromValidString(nftId);
				if (urn.namespaceMethod() === 'iota') {
					exploreUrl = createExplorerNftUrl(nftId);
				}
			}
		}
		busy = false;
	});

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('components.attestationView.title')}</Heading>
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
						{$i18n('components.attestationView.id')}
						<LabelledValue>{itemId}</LabelledValue>
					</Label>
					{#if Is.stringValue(exploreUrl)}
						<div>
							<Button size="xs" on:click={openExplorer} class="gap-2"
								>{$i18n('components.attestationView.exploreNft')}<CloudArrowUpOutline
									size="sm"
								/></Button
							>
						</div>
					{/if}
				</div>
				<QR
					qrData={createPublicUrl(`attestation/${itemId}`)}
					label={$i18n('components.attestationView.attestationQr')}
					dimensions={128}
				/>
			</div>
			<Label>
				{$i18n('components.attestationView.verified')}
				<LabelledValue>{item?.verified}</LabelledValue>
			</Label>
			{#if Is.stringValue(item?.verificationFailure)}
				<Label>
					{$i18n('components.attestationView.verifyFailure')}
					<LabelledValue class="red">{item.verificationFailure}</LabelledValue>
				</Label>
			{/if}
			{#if Is.stringValue(item?.dateCreated)}
				<Label>
					{$i18n('components.attestationView.created')}
					<LabelledValue>{new Date(item.dateCreated).toLocaleString()}</LabelledValue>
				</Label>
			{/if}
			{#if Is.stringValue(item?.ownerIdentity)}
				<Label>
					{$i18n('components.attestationView.ownerIdentity')}
					<LabelledValue>{item.ownerIdentity}</LabelledValue>
				</Label>
			{/if}
			{#if Is.stringValue(item?.dateTransferred)}
				<Label>
					{$i18n('components.attestationView.transferred')}
					<LabelledValue>{new Date(item.dateTransferred)}</LabelledValue>
				</Label>
			{/if}
			{#if Is.stringValue(item?.holderIdentity)}
				<Label>
					{$i18n('components.attestationView.holderIdentity')}
					<LabelledValue>{item.holderIdentity}</LabelledValue>
				</Label>
			{/if}
			{#if Is.object(item?.attestationObject)}
				<Label>
					{$i18n('components.attestationView.attestationObject')}
					<Code>{JSON.stringify(item.attestationObject, undefined, 2)}</Code>
				</Label>
			{/if}
			{#if Is.object(item?.proof)}
				<Label>
					{$i18n('components.attestationView.proof')}
					<Code>{JSON.stringify(item.proof, undefined, 2)}</Code>
				</Label>
			{/if}
		</div>
	{/if}
	{#if Is.stringValue(returnUrl)}
		<div class="flex flex-row gap-2">
			<Button on:click={() => goto(returnUrl)}>{$i18n('actions.back')}</Button>
		</div>
	{/if}
</Card>
