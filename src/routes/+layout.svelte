<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import favicon32 from '$lib/assets/favicon-32x32.png';
	import favicon16 from '$lib/assets/favicon-16x16.png';
	import siteWebmanifest from '$lib/assets/site.webmanifest';
	import appleTouchIcon from '$lib/assets/apple-touch-icon.png';
	import Navbar from '$lib/components/navbar/navbar.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon} />
	<link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
	<link rel="icon" type="image/png" sizes="16x16" href={favicon16} />
	<link rel="manifest" href={siteWebmanifest} />
</svelte:head>

<Navbar />
<main class="w-full bg-gallery-100 text-gallery-700">
	{@render children()}
</main>

<Footer />

<style>
	:global(body) {
		background-color: var(--color-gallery-50);
		color: var(--gallery-800);
		margin: 0;
	}
	:global(a) {
		color: var(--color-gallery-900);
		text-underline-offset: 4px;
		text-decoration: underline;
	}
	:global(::selection) {
		background-color: var(--color-accent-200);
		color: var(--color-accent-500);
	}
</style>
