<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Heading,
		i18n,
		Icons,
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
	import { onMount } from 'svelte';
	import type { IUserImmutableStorageEntry } from '../../models/IUserImmutableStorageEntry';
	import { immutableStorageRemove } from '$stores/immutableStorage';
	import {
		immutableStorageEntryList,
		immutableStorageEntryRemove
	} from '$stores/immutableStorages';

	let items: IUserImmutableStorageEntry[] | undefined;
	const cursorStack: string[] = ['@start'];
	let cursorStackIndex: number = 0;
	let busy = false;
	let status = '';
	let isError = false;
	let canGoBackwards = true;
	let canGoForwards = true;
	let confirmationId: string = '';
	let modalIsBusy = false;

	async function loadData(): Promise<void> {
		status = $i18n('pages.immutableStorage.loading');
		busy = true;
		isError = false;
		const result = await immutableStorageEntryList(
			cursorStack[cursorStackIndex]?.startsWith('@') ? undefined : cursorStack[cursorStackIndex]
		);

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			items = result?.items ?? [];

			if (cursorStackIndex === cursorStack.length - 1) {
				cursorStack.push(result?.cursor ?? '@end');
			}

			canGoBackwards = cursorStack[cursorStackIndex] !== '@start';
			canGoForwards = cursorStack[cursorStackIndex + 1] !== '@end';

			if (items.length === 0) {
				status = $i18n('pages.immutableStorage.noItems');
			} else {
				status = '';
			}
		}
		busy = false;
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
		modalIsBusy = false;
	}

	async function remove(): Promise<void> {
		if (Is.stringValue(confirmationId)) {
			modalIsBusy = true;
			await immutableStorageRemove(confirmationId);
			await immutableStorageEntryRemove(confirmationId);
			await loadData();
			confirmationId = '';
			modalIsBusy = false;
		}
	}

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4">{$i18n('pages.immutableStorage.title')}</Heading>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
			{#if Is.stringValue(status)}
				<P class={isError ? 'text-red-600' : ''}>{status}</P>
			{/if}
		</div>
		<Button on:click={() => goto('/secure/immutable-storage/create')} disabled={busy}
			>{$i18n('pages.immutableStorage.createItem')}</Button
		>
	</div>

	{#if Is.arrayValue(items)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.immutableStorageProperties.id')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.description')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.dateCreated')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.immutableStorageProperties.data')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each items as item}
					<TableBodyRow>
						<TableBodyCell class="whitespace-normal">{item.id}</TableBodyCell>
						<TableBodyCell>{item.description}</TableBodyCell>
						<TableBodyCell>{new Date(item.date).toLocaleString()}</TableBodyCell>
						<TableBodyCell>{item.data.slice(0, 50)}...</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2"
							><Button
								size="xs"
								color="plain"
								on:click={() => goto(`/secure/immutable-storage/${item.id}`)}
								><Icons.EyeSolid /></Button
							><Button size="xs" color="plain" on:click={async () => removePrompt(item.id)}
								><Icons.TrashBinSolid /></Button
							></TableBodyCell
						>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
		<ModalYesNo
			title={$i18n('pages.immutableStorage.deleteTitle')}
			open={Is.stringValue(confirmationId)}
			message={$i18n('pages.immutableStorage.deleteMessage')}
			busy={modalIsBusy}
			yesColor="error"
			yesAction={async () => remove()}
			noAction={async () => removeCancel()}
		/>
	{/if}
</section>
