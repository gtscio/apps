<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Converter, Is } from '@twin.org/core';
	import { i18n, Card, Heading, Code, Label, Span, Spinner } from '@twin.org/ui-components-svelte';
	import { Jwt, type IJwtHeader, type IJwtPayload } from '@twin.org/web';
	import { onMount } from 'svelte';

	export let proof: string;

	const parts = proof.split(':');
	const proofType = parts[0];
	const proofValue = parts[1];

	let jwtHeader: IJwtHeader | undefined;
	let jwtPayload: IJwtPayload | undefined;
	let jwtSignature: Uint8Array | undefined;
	let busy = true;

	onMount(async () => {
		if (proofType === 'JwtProof') {
			const decoded = await Jwt.decode(proofValue);
			jwtHeader = decoded.header;
			jwtPayload = decoded.payload;
			jwtSignature = decoded.signature;
		}
		busy = false;
	});
</script>

<Card class="h-full max-h-full max-w-full gap-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.proofView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>

	{#if Is.stringValue(proofType)}
		<Label>
			{$i18n('pages.proofView.type')}
			<Span>{proofType}</Span>
		</Label>
	{/if}
	{#if Is.object(jwtHeader)}
		<Label>
			{$i18n('pages.proofView.header')}
			<Code>{JSON.stringify(jwtHeader, null, 2)}</Code>
		</Label>
	{/if}
	{#if Is.object(jwtPayload)}
		<Label>
			{$i18n('pages.proofView.payload')}
			<Code>{JSON.stringify(jwtPayload, null, 2)}</Code>
		</Label>
	{/if}
	{#if Is.uint8Array(jwtSignature)}
		<Label>
			{$i18n('pages.proofView.signature')}
			<Code>{Converter.bytesToBase64(jwtSignature)}</Code>
		</Label>
	{/if}
</Card>
