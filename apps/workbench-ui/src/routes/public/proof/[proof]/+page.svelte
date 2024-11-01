<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import ProofView from '$components/proof/proofView.svelte';
</script>

<ProofView proof={$page.params.proof} />
