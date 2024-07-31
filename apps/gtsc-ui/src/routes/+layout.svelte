<script lang="ts">
	import '../app.css';
	import Sidebar from '../components/sidebar.svelte';
	import Footer from '../components/footer.svelte';
	import Header from '../components/header.svelte';
	import ServerStatus from '../components/serverStatus.svelte';
</script>

<div class="flex h-screen min-w-96 flex-col overflow-hidden">
	<Header />
	<div class="mt-16 flex h-full overflow-hidden sm:mt-20">
		<div
			class="flex h-full w-64 flex-col place-content-between overflow-y-auto bg-gray-50 dark:bg-gray-800"
		>
			<Sidebar />
			<ServerStatus />
		</div>
		<div class="flex h-full flex-1 flex-col overflow-y-auto bg-white p-4 dark:bg-gray-900">
			<slot></slot>
		</div>
	</div>
	<Footer />
</div>
