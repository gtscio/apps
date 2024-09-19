<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { HealthStatus } from '@twin.org/api-models';
	import { Is } from '@twin.org/core';
	import { i18n } from '$stores/i18n';
	import { serverHealthStatus, serverName, serverVersion } from '$stores/information';
	import { Badge } from '$ui/components';
</script>

{#if !Is.empty($serverHealthStatus)}
	{#if $serverHealthStatus !== HealthStatus.Error}
		<Badge color={$serverHealthStatus === HealthStatus.Ok ? 'green' : 'yellow'} large
			>{$i18n('serverStatus.api')}: {$serverName} v{$serverVersion}</Badge
		>
	{:else}
		<Badge color="red" large
			>{$i18n('serverStatus.api')}: {$i18n('serverStatus.notConnected')}</Badge
		>
	{/if}
{/if}
