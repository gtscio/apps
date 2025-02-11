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
		Select,
		Card,
		Icons
	} from '@twin.org/ui-components-svelte';
	import { Tooltip } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { loggingQuery } from '$stores/logging';

	let entities: ILogEntry[] | undefined;
	let cursorStack: string[] = ['@start'];
	let cursorStackIndex: number = 0;
	let busy = false;
	let status = '';
	let level: LogLevel | undefined = undefined;
	let source: string | undefined = undefined;
	let timeStart: string | undefined = undefined;
	let timeEnd: string | undefined = undefined;
	let pageSize = 50;
	let isError = false;
	let canGoBackwards = true;
	let canGoForwards = true;
	const logLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

	async function loadData(): Promise<void> {
		status = $i18n('pages.logging.loading');
		busy = true;
		isError = false;
		const validTimeStart = timeStart ? new Date(timeStart).getTime() : undefined;
		const validTimeEnd = timeEnd ? new Date(timeEnd).getTime() : undefined;
		const result = await loggingQuery(
			level,
			source,
			validTimeStart,
			validTimeEnd,
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

	async function action(): Promise<void> {
		cursorStackIndex = 0;
		cursorStack = ['@start'];
		if (source === '') {
			source = undefined;
		}
		if (!Is.number(pageSize) || pageSize < 1) {
			pageSize = 50;
		}

		if (timeStart === '') {
			timeStart = undefined;
		}
		if (timeEnd === '') {
			timeEnd = undefined;
		}
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
	<Card class="w-full max-w-full rounded-lg border border-gray-300 p-4">
		<div class="block flex-row gap-2 lg:flex">
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
				{$i18n('pages.loggingProperties.timeStart')}
				<Input
					name="timeStart"
					placeholder={$i18n('pages.loggingProperties.timeStart')}
					color="default"
					bind:value={timeStart}
					type="date"
					disabled={busy}
				></Input>
			</Label>
			<Label>
				{$i18n('pages.loggingProperties.timeEnd')}
				<Input
					name="timeEnd"
					placeholder={$i18n('pages.loggingProperties.timeEnd')}
					color="default"
					bind:value={timeEnd}
					type="date"
					disabled={busy}
				></Input>
			</Label>
		</div>
		<Button class="mt-4 max-w-20" on:click={async () => action()} disabled={busy}>
			{$i18n('pages.logging.action')}
		</Button>
	</Card>

	{#if Is.arrayValue(entities)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.loggingProperties.level')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.source')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.message')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.error')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.data')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.loggingProperties.ts')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.logging.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each entities as item}
					<TableBodyRow>
						<TableBodyCell class="whitespace-normal">{item.level}</TableBodyCell>
						<TableBodyCell>{item.source}</TableBodyCell>
						<TableBodyCell>{item.message}</TableBodyCell>
						<TableBodyCell>
							{#if item.error && JSON.stringify(item.error).length > 50}
								{JSON.stringify(item.error).slice(0, 50)}...
							{:else}
								{JSON.stringify(item.error)}
							{/if}
						</TableBodyCell>
						<TableBodyCell>
							{#if item.data && JSON.stringify(item.data).length > 50}
								{JSON.stringify(item.data).slice(0, 50)}...
							{:else}
								{JSON.stringify(item.data)}
							{/if}
						</TableBodyCell>
						<TableBodyCell>{item.ts ? new Date(item.ts) : ''}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button
								size="xs"
								color="plain"
								on:click={async () => navigator.clipboard.writeText(JSON.stringify(item))}
							>
								<Icons.ClipboardListOutline />
							</Button>
							<Tooltip>{$i18n('pages.logging.copyAllClipboard')}</Tooltip>
							<Button
								size="xs"
								color="plain"
								on:click={async () => navigator.clipboard.writeText(JSON.stringify(item.data))}
							>
								<Icons.ClipboardCheckOutline />
							</Button>
							<Tooltip>{$i18n('pages.logging.copyDataClipboard')}</Tooltip>
							<Button
								size="xs"
								color="plain"
								on:click={async () => navigator.clipboard.writeText(JSON.stringify(item.error))}
							>
								<Icons.ExclamationCircleOutline />
							</Button>
							<Tooltip>{$i18n('pages.logging.copyErrorClipboard')}</Tooltip>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
	{/if}
</section>
