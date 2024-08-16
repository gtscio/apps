<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Converter } from '@gtsc/core';
	import { PngRenderer, QR } from '@gtsc/qr';
	import { onMount } from 'svelte';
	import { i18n } from '../stores/i18n';

	export let qrData: string;
	export let labelResource: string;
	export let dimensions: number;
	export let foreground: string = '#000000';
	export let background: string = '#FFFFFF';
	export let className: string | undefined;
	export { className as class };

	let pngBase64: string;
	const linkItem: boolean = qrData.startsWith('http');

	onMount(async () => {
		const qr = new QR(0);
		qr.addText(qrData);

		const cellData = qr.generate();

		const pngData = await PngRenderer.render(cellData, { foreground, background });
		pngBase64 = `data:image/png;base64,${Converter.bytesToBase64(pngData)}`;
	});
</script>

<div
	class={className}
	style="width:{`${dimensions}px`};height:{`${dimensions}px`};min-width:{`${dimensions}px`};min-height:{`${dimensions}px`}"
>
	{#if linkItem}
		<a href={qrData} target="_blank"> <img src={pngBase64} alt={$i18n(labelResource)} /></a>
	{:else}
		<img src={pngBase64} alt={$i18n(labelResource)} />
	{/if}
</div>
