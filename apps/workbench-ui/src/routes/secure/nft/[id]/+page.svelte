<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import NftView from '$components/nft/nftView.svelte';
</script>

<NftView itemId={$page.params.id} returnUrl="/secure/nft" />
