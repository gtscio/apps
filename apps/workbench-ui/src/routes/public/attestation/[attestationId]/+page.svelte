<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import type { IAttestationInformation } from '@twin.org/attestation-models';
	import { Is, Urn } from '@twin.org/core';
	import {
		Button,
		Card,
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

	const attestationId = $page.params.attestationId;
	let error: string;
	let isBusy = true;
	let attestationInfo: Partial<IAttestationInformation> | undefined;
	let exploreUrl: string | undefined;

	onMount(async () => {
		error = '';
		const resultVerify = await attestationGet(attestationId);
		if (Is.stringValue(resultVerify?.error)) {
			error = resultVerify.error;
		} else {
			attestationInfo = resultVerify?.information;
			if (Is.stringValue(attestationInfo?.id)) {
				const nftId = attestationIdToNftId(attestationInfo.id);

				const urn = Urn.fromValidString(nftId);
				if (urn.namespaceMethod() === 'iota') {
					exploreUrl = createExplorerNftUrl(nftId);
				}
			}
		}
		isBusy = false;
	});

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.attestationPublic.title')}</Heading>
		{#if isBusy}
			<Spinner />
		{/if}
	</div>
	<Error {error} />
	{#if !isBusy}
		<div class="flex flex-row justify-between gap-5">
			<div class="flex flex-col gap-4">
				<Label>
					{$i18n('pages.attestationPublic.id')}
					<LabelledValue>{attestationId}</LabelledValue>
				</Label>
				{#if Is.stringValue(exploreUrl)}
					<Label>
						<Button size="xs" on:click={openExplorer} class="gap-2"
							>{$i18n('pages.attestationPublic.exploreNft')}<CloudArrowUpOutline
								size="sm"
							/></Button
						>
					</Label>
				{/if}

				<Label>
					{$i18n('pages.attestationPublic.verified')}
					<LabelledValue>{attestationInfo?.verified}</LabelledValue>
				</Label>
				{#if Is.stringValue(attestationInfo?.verificationFailure)}
					<Label>
						{$i18n('pages.attestationPublic.verifyFailure')}
						<LabelledValue class="red">{attestationInfo.verificationFailure}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(attestationInfo?.dateCreated)}
					<Label>
						{$i18n('pages.attestationPublic.created')}
						<LabelledValue>{new Date(attestationInfo.dateCreated).toLocaleString()}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(attestationInfo?.ownerIdentity)}
					<Label>
						{$i18n('pages.attestationPublic.ownerIdentity')}
						<LabelledValue>{attestationInfo.ownerIdentity}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(attestationInfo?.dateTransferred)}
					<Label>
						{$i18n('pages.attestationPublic.transferred')}
						<LabelledValue>{new Date(attestationInfo.dateTransferred)}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(attestationInfo?.holderIdentity)}
					<Label>
						{$i18n('pages.attestationPublic.holderIdentity')}
						<LabelledValue>{attestationInfo.holderIdentity}</LabelledValue>
					</Label>
				{/if}
				{#if Is.object(attestationInfo?.attestationObject)}
					<Label>
						{$i18n('pages.attestationPublic.attestationObject')}
						<LabelledValue
							>{JSON.stringify(attestationInfo.attestationObject, undefined, 2)}</LabelledValue
						>
					</Label>
				{/if}
				{#if Is.object(attestationInfo?.proof)}
					<Label>
						{$i18n('pages.attestationPublic.proof')}
						<LabelledValue>{JSON.stringify(attestationInfo.proof, undefined, 2)}</LabelledValue>
					</Label>
				{/if}
			</div>
			<QR
				qrData={createPublicUrl(`attestation/${attestationId}`)}
				labelResource="pages.attestationPublic.attestationQr"
				dimensions={128}
			/>
		</div>
	{/if}
</Card>
