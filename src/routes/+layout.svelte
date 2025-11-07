<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import favicon32 from '$lib/assets/favicon-32x32.png';
	import favicon16 from '$lib/assets/favicon-16x16.png';
	import siteWebmanifest from '$lib/assets/site.webmanifest';
	import appleTouchIcon from '$lib/assets/apple-touch-icon.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon} />
	<link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
	<link rel="icon" type="image/png" sizes="16x16" href={favicon16} />
	<link rel="manifest" href={siteWebmanifest} />
</svelte:head>

<main class="h-screen w-full overflow-y-auto bg-zinc-900">
	{@render children()}
</main>

<style>
	:global(body) {
		background-color: var(--zinc-900);
	}
</style>
