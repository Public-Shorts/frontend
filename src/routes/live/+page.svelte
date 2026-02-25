<script lang="ts">
	import { onMount } from 'svelte';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor, slugify } from '$lib/sanity';

	let { data } = $props();

	type Entry = (typeof data.entries)[number];

	let now = $state(Date.now());

	onMount(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 1000);

		requestAnimationFrame(() => {
			document
				.querySelector('[data-now-playing]')
				?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		});

		return () => clearInterval(interval);
	});

	// --- Time helpers ---

	function parseIso(iso: string): Date {
		let s = iso;
		if (!s.includes('+') && !s.includes('Z')) s += '+01:00';
		s = s.replace(/([+-])(\d)$/, '$10$2:00');
		s = s.replace(/([+-]\d{2})$/, '$1:00');
		return new Date(s);
	}

	function formatTimeHMS(iso: string): string {
		return parseIso(iso).toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			timeZone: 'Europe/Berlin',
			hour12: false,
		});
	}

	function formatMMSS(totalSeconds: number): string {
		const s = Math.max(0, Math.floor(totalSeconds));
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	}

	function entryStatus(entry: Entry): 'past' | 'playing' | 'upcoming' {
		const startMs = parseIso(entry.startTime).getTime();
		const endMs = startMs + entry.durationSeconds * 1000;
		if (now >= startMs && now < endMs) return 'playing';
		if (now >= endMs) return 'past';
		return 'upcoming';
	}

	// --- Derived state ---

	const currentIndex = $derived(data.entries.findIndex((e) => entryStatus(e) === 'playing'));

	const currentEntry = $derived(currentIndex >= 0 ? data.entries[currentIndex] : null);

	const currentDetails = $derived(
		currentEntry?.film ? data.filmDetailsMap[currentEntry.film._id] : null
	);

	const progress = $derived(() => {
		if (!currentEntry) return { fraction: 0, elapsed: 0, remaining: 0 };
		const startMs = parseIso(currentEntry.startTime).getTime();
		const elapsed = (now - startMs) / 1000;
		const remaining = currentEntry.durationSeconds - elapsed;
		const fraction = Math.min(1, Math.max(0, elapsed / currentEntry.durationSeconds));
		return { fraction, elapsed, remaining };
	});

	const imageUrl = $derived(() => {
		if (!currentEntry?.film) return null;
		if (currentEntry.film.poster) {
			return urlFor(currentEntry.film.poster).width(600).height(800).fit('crop').url();
		}
		if (currentEntry.film.screenshot) {
			return urlFor(currentEntry.film.screenshot).width(800).height(450).fit('crop').url();
		}
		return null;
	});

	const showOriginalTitle = $derived(
		currentEntry?.film &&
			currentEntry.film.originalTitle &&
			currentEntry.film.originalTitle !== currentEntry.film.englishTitle
	);

	// Next up (first upcoming entry after current)
	const nextEntry = $derived(
		currentIndex >= 0 && currentIndex + 1 < data.entries.length
			? data.entries[currentIndex + 1]
			: null
	);
</script>

<SEO
	title="Now Playing"
	description="See what's currently playing on the Public Shorts 24/7 video loop."
/>

<GridLayout>
	{#if data.dev}
		<div class="md:col-span-6">
			<div class="flex items-center gap-2 text-sm">
				<span class="text-gallery-500">Source:</span>
				<a
					href="/live"
					class="rounded px-2 py-1 transition-colors {data.source === 'test'
						? 'bg-gallery-200 text-gallery-900'
						: 'text-gallery-500 hover:text-gallery-700'}"
				>
					Test
				</a>
				<a
					href="/live?source=production"
					class="rounded px-2 py-1 transition-colors {data.source === 'production'
						? 'bg-gallery-200 text-gallery-900'
						: 'text-gallery-500 hover:text-gallery-700'}"
				>
					Production
				</a>
			</div>
		</div>
	{/if}

	{#if currentEntry?.film}
		{@const film = currentEntry.film}
		{@const details = currentDetails}
		{@const p = progress()}
		{@const img = imageUrl()}

		<!-- Now Playing header -->
		<div class="md:col-span-6">
			<div class="flex items-center gap-2 text-sm text-gallery-500">
				<span class="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
				Now Playing
			</div>
		</div>

		<!-- Image -->
		{#if img}
			<div class="md:col-span-2">
				<img
					src={img}
					alt={film.englishTitle}
					class="w-full object-cover {film.poster ? 'aspect-3/4' : 'aspect-video'}"
				/>
			</div>
		{/if}

		<!-- Film info -->
		<div class="flex flex-col gap-4 {img ? 'md:col-span-4' : 'md:col-span-6'}">
			<div>
				<h1 class="text-3xl font-bold">
					{film.englishTitle}
				</h1>
				{#if showOriginalTitle}
					<p class="mt-1 text-lg text-gallery-500">{film.originalTitle}</p>
				{/if}
			</div>

			<div>
				<p class="font-semibold">{film.directorName}</p>
				{#if details?.website}
					<a
						href={details.website}
						target="_blank"
						rel="noreferrer"
						class="text-sm text-gallery-500 underline decoration-gallery-400 underline-offset-2 hover:text-gallery-800"
					>
						{details.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
					</a>
				{/if}
			</div>

			<p class="text-sm text-gallery-500">
				{film.length} min{#if film.categories?.length}&ensp;·&ensp;{film.categories.join(', ')}{/if}
			</p>

			{#if details?.synopsis}
				<p class="leading-relaxed text-gallery-700">{details.synopsis}</p>
			{/if}

			{#if details?.castAndCrew}
				<div>
					<p class="text-sm font-semibold text-gallery-500">Cast & Crew</p>
					<p class="whitespace-pre-line text-sm text-gallery-600">{details.castAndCrew}</p>
				</div>
			{/if}

			{#if details?.thanks}
				<div>
					<p class="text-sm font-semibold text-gallery-500">Thanks</p>
					<p class="whitespace-pre-line text-sm text-gallery-600">{details.thanks}</p>
				</div>
			{/if}
		</div>

		<!-- Progress bar -->
		<div class="md:col-span-6">
			<div class="flex items-center gap-3 text-xs font-mono text-gallery-500">
				<span>{formatMMSS(p.elapsed)}</span>
				<div class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gallery-200">
					<div
						class="absolute inset-y-0 left-0 rounded-full bg-accent-500 transition-[width] duration-1000 ease-linear"
						style:width="{p.fraction * 100}%"
					></div>
				</div>
				<span>-{formatMMSS(p.remaining)}</span>
			</div>
			{#if nextEntry?.film}
				<p class="mt-2 text-xs text-gallery-400">
					Next: {nextEntry.film.englishTitle}
				</p>
			{/if}
		</div>

		<!-- Schedule -->
		<div class="md:col-span-6">
			<h2 class="mb-3 text-base font-semibold">Schedule</h2>
			<div class="schedule max-h-80 overflow-y-auto">
				{#each data.entries as entry, i}
					{#if entry.film}
						{@const status = entryStatus(entry)}
						<a
							data-now-playing={status === 'playing' ? '' : undefined}
							href="/programme/{slugify(entry.film.englishTitle)}"
							class="flex items-baseline gap-4 border-b border-gallery-200/50 py-2 text-sm transition-colors
								{status === 'past'
								? 'opacity-30'
								: status === 'playing'
									? 'font-medium text-gallery-900'
									: 'text-gallery-600 hover:text-accent-500'}"
						>
							<span class="w-20 shrink-0 font-mono text-xs">
								{formatTimeHMS(entry.startTime)}
							</span>
							<span class="min-w-0 flex-1 truncate">
								{entry.film.englishTitle}
							</span>
							<span class="shrink-0 font-mono text-xs text-gallery-400">
								{formatMMSS(entry.durationSeconds)}
							</span>
						</a>
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		<!-- Fallback: nothing playing -->
		<div class="md:col-span-6">
			<h1 class="text-3xl font-bold">Now Playing</h1>
			<p class="mt-4 text-gallery-600">
				Nothing is currently playing. Check the
				<a
					href="/schedule"
					class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				>
					full schedule
				</a>
				for upcoming screenings.
			</p>
		</div>
	{/if}
</GridLayout>

<style>
	.schedule a {
		text-decoration: none;
	}
</style>
