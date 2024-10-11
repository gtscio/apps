<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import { Button, Heading, i18n, Spinner, P } from '@twin.org/ui-components-svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { EyeOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import type { IUserAttestationEntry } from '$models/IUserAttestationEntry';
	import { attestationsList } from '$stores/attestations';

	let attestations: IUserAttestationEntry[] | undefined;
	const cursorStack: string[] = ['@start'];
	let cursorStackIndex: number = 0;
	let isBusy = false;
	let status = '';
	let isError = false;
	let canGoBackwards = true;
	let canGoForwards = true;

	async function loadData(): Promise<void> {
		status = $i18n('pages.attestations.loading');
		isBusy = true;
		isError = false;
		const result = await attestationsList(cursorStack[cursorStackIndex]);

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			attestations = result?.entities ?? [];

			if (cursorStackIndex === cursorStack.length - 1) {
				cursorStack.push(result?.cursor ?? '@end');
			}

			canGoBackwards = cursorStack[cursorStackIndex] !== '@start';
			canGoForwards = cursorStack[cursorStackIndex + 1] !== '@end';

			if (attestations.length === 0) {
				status = $i18n('pages.attestations.noAttestations');
			} else {
				status = '';
			}
		}
		isBusy = false;
	}

	async function loadPrevious(): Promise<void> {
		cursorStackIndex--;
		await loadData();
	}

	async function loadNext(): Promise<void> {
		cursorStackIndex++;
		await loadData();
	}

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4">{$i18n('pages.attestations.title')}</Heading>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if isBusy}
				<Spinner />
			{/if}
			{#if Is.stringValue(status)}
				<P class={isError ? 'text-red-600' : ''}>{status}</P>
			{/if}
		</div>
		<Button on:click={() => goto('/secure/attestations/add')} disabled={isBusy}
			>{$i18n('pages.attestations.addAttestation')}</Button
		>
	</div>

	{#if Is.arrayValue(attestations)}
		<div class="w-full min-w-96 overflow-x-auto rounded-md border">
			<Table>
				<TableHead>
					<TableHeadCell>Description</TableHeadCell>
					<TableHeadCell>Date Created</TableHeadCell>
					<TableHeadCell>Actions</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each attestations as attestation}
						<TableBodyRow>
							<TableBodyCell class="whitespace-normal break-all"
								>{attestation.description}</TableBodyCell
							>
							<TableBodyCell>{new Date(attestation.dateCreated).toLocaleString()}</TableBodyCell>
							<TableBodyCell
								><Button
									size="xs"
									outline
									on:click={() => goto(`/secure/attestations/${attestation.id}`)}
									><EyeOutline /></Button
								></TableBodyCell
							>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</div>
		<div class="flex flex-row gap-2">
			<Button
				outline
				size="xs"
				disabled={!canGoBackwards || isBusy}
				on:click={async () => loadPrevious()}>Previous</Button
			>
			<Button
				outline
				size="xs"
				disabled={!canGoForwards || isBusy}
				on:click={async () => loadNext()}>Next</Button
			>
		</div>
	{/if}
</section>
