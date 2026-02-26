<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import Icon from '@iconify/svelte';
	import Logo from '../logo/logo.svelte';

	let {
		scheduleDateStart = null,
		scheduleDateEnd = null,
		isDev = false
	}: {
		scheduleDateStart: string | null;
		scheduleDateEnd: string | null;
		isDev: boolean;
	} = $props();

	let open = false;
	let showAudio = $state(isDev);

	onMount(() => {
		if (navigator.userAgent.includes('Firefox')) {
			showAudio = false;
			return;
		}
		if (isDev) return;
		if (!scheduleDateStart || !scheduleDateEnd) return;
		const now = Date.now();
		const start = new Date(scheduleDateStart).getTime();
		const end = new Date(scheduleDateEnd).getTime();
		showAudio = now >= start && now <= end;
	});
</script>

<nav
	class=" flex w-full items-center justify-center border-b border-gallery-200 bg-gallery-50 py-12"
>
	<a href="/" class="absolute left-4 w-28 fill-gallery-800">
		<Logo />
	</a>
	<section
		class="hidden w-full max-w-5xl grid-cols-1 gap-6 gap-y-10 text-base sm:grid-cols-6 lg:grid"
	>
		<div class="col-span-4 col-start-2 flex gap-10">
			<a
				class=" text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/festival">Festival</a
			>
			<a
				class=" text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/programme">Programme</a
			>
			<a class=" text-gallery-700 transition-all duration-150 hover:text-gallery-400" href="/events"
				>Events</a
			>
			<a
				class=" text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/partners">Partners</a
			>
			<a class=" text-gallery-700 transition-all duration-150 hover:text-gallery-400" href="/press"
				>Press</a
			>
			<!-- <a
				class=" text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/opencall">Open Call</a
			> -->
		</div>
	</section>
	<div class="absolute right-4 hidden items-center gap-4 lg:flex">
		{#if showAudio && browser}
			{#await import('./LiveAudioToggle.svelte') then module}
				<module.default />
			{/await}
		{/if}
		<LanguageSwitcher />
	</div>
	<div class="absolute right-4 flex items-center gap-4 lg:hidden">
		{#if showAudio && browser}
			{#await import('./LiveAudioToggle.svelte') then module}
				<module.default />
			{/await}
		{/if}
		<button
			class="flex flex-col gap-2"
			aria-label="Toggle navigation"
			on:click={() => (open = !open)}
		>
			<Icon icon="material-symbols:menu" width="64" />
		</button>
	</div>
</nav>

{#if open}
	<nav
		class="flex flex-col gap-8 border-b border-gallery-200 bg-gallery-50 px-8 py-16 text-2xl lg:hidden"
	>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/festival">Festival</a>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/programme">Programme</a>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/events">Events</a>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/partners">Partners</a>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/press">Press</a>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/opencall">Open Call</a>

		<LanguageSwitcher />
	</nav>
{/if}

<style>
	a {
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
		text-decoration-line: 4px;
	}
</style>
