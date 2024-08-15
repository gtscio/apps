<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { HealthStatus } from '@gtsc/api-models';
	import { Is } from '@gtsc/core';
	import { Badge } from 'flowbite-svelte';
	import { i18n } from '../stores/i18n';
	import { serverHealthStatus, serverName, serverVersion } from '../stores/information';
</script>

{#if !Is.empty($serverHealthStatus)}
	<div class="m-3 flex justify-center">
		{#if $serverHealthStatus !== HealthStatus.Error}
			<Badge color={$serverHealthStatus === HealthStatus.Ok ? 'green' : 'yellow'}
				>{$i18n('serverStatus.api')}: {$serverName} v{$serverVersion}</Badge
			>
		{:else}
			<Badge color="red">{$i18n('serverStatus.api')}: {$i18n('serverStatus.notConnected')}</Badge>
		{/if}
	</div>
{/if}
