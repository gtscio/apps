<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import AttestationView from '$components/attestation/attestationView.svelte';
</script>

<AttestationView itemId={$page.params.id} returnUrl="/secure/attestation" />
