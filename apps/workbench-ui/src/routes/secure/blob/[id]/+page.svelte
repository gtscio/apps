<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import BlobView from '$components/blob/blobView.svelte';
</script>

<BlobView itemId={$page.params.id} />
