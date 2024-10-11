<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import AttestationView from '$components/attestationView.svelte';

	const attestationId = $page.params.attestationId;
</script>

<AttestationView {attestationId} showBack />
