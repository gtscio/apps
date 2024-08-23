<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import type { IAttestationInformation } from '@gtsc/attestation-models';
	import { Is, Urn } from '@gtsc/core';
	import { CloudArrowUpOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { Button, Card, Heading, Label, Spinner } from '../../../../components/design-system';
	import Error from '../../../../components/error.svelte';
	import LabelledValue from '../../../../components/labelledValue.svelte';
	import Qr from '../../../../components/qr.svelte';
	import type { IDocumentAttestation } from '../../../../models/IDocumentAttestation';
	import { createPublicUrl } from '../../../../stores/app';
	import { attestationVerify } from '../../../../stores/attestation';
	import { i18n } from '../../../../stores/i18n';
	import { attestationIdToNftId, createExplorerNftUrl } from '../../../../stores/iota';

	const attestationId = $page.params.attestationId;
	let error: string;
	let isBusy = true;
	let attestationInfo: Partial<IAttestationInformation<IDocumentAttestation>> | undefined;
	let isVerified: boolean | undefined;
	let verifyFailure: string | undefined;
	let exploreUrl: string | undefined;

	onMount(async () => {
		error = '';
		const resultVerify = await attestationVerify(attestationId);
		if (Is.stringValue(resultVerify?.error)) {
			error = resultVerify.error;
		} else {
			attestationInfo = resultVerify?.information;
			isVerified = resultVerify?.verified;
			verifyFailure = resultVerify?.failure;
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
			<Spinner size={5} color="white" />
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
					<LabelledValue>{isVerified}</LabelledValue>
				</Label>
				{#if Is.stringValue(verifyFailure)}
					<Label>
						{$i18n('pages.attestationPublic.verifyFailure')}
						<LabelledValue class="red">{verifyFailure}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(attestationInfo?.created)}
					<Label>
						{$i18n('pages.attestationPublic.created')}
						<LabelledValue>{new Date(attestationInfo.created).toLocaleString()}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(attestationInfo?.ownerIdentity)}
					<Label>
						{$i18n('pages.attestationPublic.ownerIdentity')}
						<LabelledValue>{attestationInfo.ownerIdentity}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(attestationInfo?.transferred)}
					<Label>
						{$i18n('pages.attestationPublic.transferred')}
						<LabelledValue>{new Date(attestationInfo.transferred)}</LabelledValue>
					</Label>
				{/if}
				{#if Is.stringValue(attestationInfo?.holderIdentity)}
					<Label>
						{$i18n('pages.attestationPublic.holderIdentity')}
						<LabelledValue>{attestationInfo.holderIdentity}</LabelledValue>
					</Label>
				{/if}
				{#if Is.object(attestationInfo?.data)}
					<Label>
						{$i18n('pages.attestationPublic.data')}
						<LabelledValue>{JSON.stringify(attestationInfo.data, undefined, 2)}</LabelledValue>
					</Label>
				{/if}
				{#if Is.object(attestationInfo?.proof)}
					<Label>
						{$i18n('pages.attestationPublic.proof')}
						<LabelledValue>{JSON.stringify(attestationInfo.proof, undefined, 2)}</LabelledValue>
					</Label>
				{/if}
			</div>
			<Qr
				qrData={createPublicUrl(`attestation/${attestationId}`)}
				labelResource="pages.attestationPublic.qr"
				dimensions={128}
			/>
		</div>
	{/if}
</Card>
