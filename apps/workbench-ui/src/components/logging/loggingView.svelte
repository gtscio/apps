<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is } from '@twin.org/core';
	import type { ILogEntry, LogLevel } from '@twin.org/logging-models';
	import {
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
		Pagination,
		Label,
		Input,
		Button,
		Select
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { loggingResolve } from '$stores/logging';

	let entities: ILogEntry[] | undefined;
	const cursorStack: string[] = ['@start'];
	let cursorStackIndex: number = 0;
	let busy = false;
	let status = '';
	let level: LogLevel | undefined = undefined;
	let source: string | undefined = undefined;
	let pageSize = 50;
	let word = '';
	let isError = false;
	let canGoBackwards = true;
	let canGoForwards = true;
	const logLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

	async function loadData(): Promise<void> {
		status = $i18n('pages.logging.loading');
		busy = true;
		isError = false;
		const result = await loggingResolve(
			level,
			source,
			cursorStack[cursorStackIndex]?.startsWith('@') ? undefined : cursorStack[cursorStackIndex],
			pageSize
		);

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			entities = result?.entities ?? [];

			if (cursorStackIndex === cursorStack.length - 1) {
				cursorStack.push(result?.cursor ?? '@end');
			}

			canGoBackwards = cursorStack[cursorStackIndex] !== '@start';
			canGoForwards = cursorStack[cursorStackIndex + 1] !== '@end';

			if (entities.length === 0) {
				status = $i18n('pages.logging.noItems');
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

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4">{$i18n('pages.logging.title')}</Heading>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
			{#if Is.stringValue(status)}
				<P class={isError ? 'text-red-600' : ''}>{status}</P>
			{/if}
		</div>
	</div>
	<div class="border-radius-2 w-full border border-gray-600 p-4">
		<div class="flex flex-row gap-2">
			<Label>
				{$i18n('pages.loggingProperties.pageSize')}
				<Input
					name="pageSize"
					placeholder={$i18n('pages.loggingProperties.pageSize')}
					color="default"
					bind:value={pageSize}
					disabled={busy}
					type="number"
				></Input>
			</Label>
			<Label>
				{$i18n('pages.loggingProperties.level')}
				<Select bind:value={level} disabled={busy}>
					<option value={undefined}>ALL</option>
					{#each logLevels as logLevel}
						<option value={logLevel}>{logLevel.toUpperCase()}</option>
					{/each}
				</Select>
			</Label>
			<Label>
				{$i18n('pages.loggingProperties.source')}
				<Input
					name="source"
					placeholder={$i18n('pages.loggingProperties.source')}
					color="default"
					bind:value={source}
					disabled={busy}
				></Input>
			</Label>
			<Label>
				{$i18n('pages.loggingProperties.word')}
				<Input
					name="word"
					placeholder={$i18n('pages.loggingProperties.word')}
					color="default"
					bind:value={word}
					disabled={busy}
				></Input>
			</Label>
		</div>
		<Button class="mt-4" on:click={async () => loadData()} disabled={busy}>
			{$i18n('pages.loggingProperties.action')}
		</Button>
	</div>

	{#if Is.arrayValue(entities)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.loggingProperties.level')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.source')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.message')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.error')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.data')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.ts')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each entities as item}
					<TableBodyRow>
						<TableBodyCell class="whitespace-normal">{item.level}</TableBodyCell>
						<TableBodyCell>{item.source}</TableBodyCell>
						<TableBodyCell>{item.message}</TableBodyCell>
						<TableBodyCell>{item.error}</TableBodyCell>
						<TableBodyCell>
							{#if item.data && JSON.stringify(item.data).length > 50}
								{JSON.stringify(item.data).slice(0, 50)}...
							{:else}
								{JSON.stringify(item.data)}
							{/if}
						</TableBodyCell>
						<TableBodyCell>{item.ts ? new Date(item.ts) : ''}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
	{/if}
</section>
