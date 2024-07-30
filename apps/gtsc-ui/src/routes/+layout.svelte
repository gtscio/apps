<script>
	import '../app.css';
	import Sidebar from '../components/sidebar.svelte';
	import Footer from '../components/footer.svelte';
	import Header from '../components/header.svelte';
</script>

<div class="flex h-screen min-w-96 flex-col overflow-hidden">
	<Header />
	<div class="mt-16 flex h-full overflow-hidden sm:mt-20">
		<div class="flex h-full w-64 flex-col overflow-y-auto">
			<Sidebar />
		</div>
		<div class="flex h-full flex-1 flex-col overflow-y-auto p-4">
			<slot></slot>
		</div>
	</div>
	<Footer />
</div>
