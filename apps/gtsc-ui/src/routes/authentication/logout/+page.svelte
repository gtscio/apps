<script lang="ts">
	import { goto } from '$app/navigation';
	import { authenticationToken } from '../../../stores/authentication';

	authenticationToken.set('');
	goto('/');
</script>
