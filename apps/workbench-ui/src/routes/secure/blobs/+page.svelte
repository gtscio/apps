<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type { IBlobStorageEntry } from '@twin.org/blob-storage-models';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Heading,
		i18n,
		Spinner,
		P,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		ModalYesNo,
		Pagination
	} from '@twin.org/ui-components-svelte';
	import { EyeSolid, TrashBinSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { blobStorageList, blobStorageRemove } from '$stores/blobStorage';

	let blobs: IBlobStorageEntry[] | undefined;
	const cursorStack: string[] = ['@start'];
	let cursorStackIndex: number = 0;
	let isBusy = false;
	let status = '';
	let isError = false;
	let canGoBackwards = true;
	let canGoForwards = true;
	let confirmationId: string = '';

	async function loadData(): Promise<void> {
		status = $i18n('pages.blobs.loading');
		isBusy = true;
		isError = false;
		const result = await blobStorageList(
			cursorStack[cursorStackIndex]?.startsWith('@') ? undefined : cursorStack[cursorStackIndex]
		);

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			blobs = result?.entries ?? [];

			if (cursorStackIndex === cursorStack.length - 1) {
				cursorStack.push(result?.cursor ?? '@end');
			}

			canGoBackwards = cursorStack[cursorStackIndex] !== '@start';
			canGoForwards = cursorStack[cursorStackIndex + 1] !== '@end';

			if (blobs.length === 0) {
				status = $i18n('pages.blobs.noItems');
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

	async function removePrompt(id: string): Promise<void> {
		confirmationId = id;
	}

	async function removeCancel(): Promise<void> {
		confirmationId = '';
	}

	async function remove(): Promise<void> {
		if (Is.stringValue(confirmationId)) {
			await blobStorageRemove(confirmationId);
			await loadData();
			confirmationId = '';
		}
	}

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4">{$i18n('pages.blobs.title')}</Heading>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if isBusy}
				<Spinner />
			{/if}
			{#if Is.stringValue(status)}
				<P class={isError ? 'text-red-600' : ''}>{status}</P>
			{/if}
		</div>
		<Button on:click={() => goto('/secure/blobs/add')} disabled={isBusy}
			>{$i18n('pages.blobs.addItem')}</Button
		>
	</div>

	{#if Is.arrayValue(blobs)}
		<Table>
			<TableHead>
				<TableHeadCell>Description</TableHeadCell>
				<TableHeadCell>Date Created</TableHeadCell>
				<TableHeadCell>Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each blobs as blob}
					<TableBodyRow>
						<TableBodyCell class="whitespace-normal break-all">{blob.metadata?.name}</TableBodyCell>
						<TableBodyCell>{new Date(blob.dateCreated).toLocaleString()}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2"
							><Button size="xs" outline on:click={() => goto(`/secure/blobs/${blob.id}`)}
								><EyeSolid /></Button
							><Button size="xs" outline on:click={async () => removePrompt(blob.id)}
								><TrashBinSolid /></Button
							></TableBodyCell
						>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={isBusy} />
		<ModalYesNo
			title={$i18n('pages.blobs.deleteTitle')}
			open={Is.stringValue(confirmationId)}
			message={$i18n('pages.blobs.deleteMessage')}
			yesAction={async () => remove()}
			noAction={async () => removeCancel()}
		/>
	{/if}
</section>
