<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main class="h-screen w-full overflow-y-auto bg-zinc-900">
	{@render children()}
</main>

<style>
	:global(body) {
		background-color: var(--zinc-900);
	}
</style>
