<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import MiniGraphSection from '$lib/components/visualiser/MiniGraphSection.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor, slugify } from '$lib/sanity';

	let { data } = $props();

	type Entry = (typeof data.entries)[number];

	let now = $state(Date.now());
	let expanded = $state(false);
	let scheduleEl = $state<HTMLDivElement>();

	onMount(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 1000);

		// Scroll schedule container so current entry is visible
		requestAnimationFrame(() => {
			if (!scheduleEl) return;
			const playing = scheduleEl.querySelector('[data-playing]');
			if (!playing) return;
			const el = playing as HTMLElement;
			scheduleEl.scrollTop = el.offsetTop - scheduleEl.offsetTop - scheduleEl.clientHeight / 2 + el.clientHeight / 2;
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
			hour12: false
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

	// --- Social media link parsing ---

	function parseSocialLink(raw: string): { url: string; label: string } | null {
		const trimmed = raw.trim();
		if (!trimmed) return null;

		// Already a full URL (instagram.com, other)
		const urlMatch = trimmed.match(/https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/([^\s/?#]+)/i);
		if (urlMatch) {
			const handle = urlMatch[3];
			return { url: `https://instagram.com/${handle}`, label: `@${handle}` };
		}

		// Full URL to some other platform
		if (/^https?:\/\//i.test(trimmed)) {
			const display = trimmed.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
			return { url: trimmed, label: display };
		}

		// @handle or plain handle (assume Instagram)
		const handle = trimmed.replace(/^@/, '');
		if (/^[a-zA-Z0-9._]+$/.test(handle)) {
			return { url: `https://instagram.com/${handle}`, label: `@${handle}` };
		}

		// Fallback: just display the text as-is, no link
		return null;
	}

	// --- Derived state ---

	const currentIndex = $derived(data.entries.findIndex((e) => entryStatus(e) === 'playing'));
	const currentEntry = $derived(currentIndex >= 0 ? data.entries[currentIndex] : null);

	const currentDetails = $derived(
		currentEntry?.film ? data.filmDetailsMap[currentEntry.film._id] : null
	);

	const currentMiniGraph = $derived(
		currentEntry?.film ? (data.miniGraphMap[currentEntry.film._id] ?? null) : null
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

	const nextEntry = $derived(
		currentIndex >= 0 && currentIndex + 1 < data.entries.length
			? data.entries[currentIndex + 1]
			: null
	);

	// Reset expanded when film changes
	let lastFilmId = $state<string | null>(null);
	$effect(() => {
		const id = currentEntry?.film?._id ?? null;
		if (id !== lastFilmId) {
			expanded = false;
			lastFilmId = id;
		}
	});

	const hasExpandedContent = $derived(() => {
		if (!currentDetails) return false;
		return !!(
			currentDetails.synopsis ||
			currentDetails.castAndCrew ||
			currentDetails.thanks ||
			currentMiniGraph
		);
	});
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

		<!-- Now Playing badge -->
		<div class="md:col-span-6">
			<div class="flex items-center gap-2 text-sm text-gallery-500">
				<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
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

		<!-- Compact film info (always visible) -->
		<div class="flex flex-col gap-3 {img ? 'md:col-span-4' : 'md:col-span-6'}">
			<div>
				<h1 class="text-3xl font-bold">
					<a
						href="/programme/{slugify(film.englishTitle)}"
						class="transition-colors hover:text-accent-500"
					>
						{film.englishTitle}
					</a>
				</h1>

				<p class="mt-1 text-lg text-gallery-500">
					{#if showOriginalTitle}
						{film.originalTitle + ' · '}
					{/if}
					{film.length} min
				</p>
			</div>

			<div>
				<p class="font-semibold">{film.directorName}</p>
				<div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
					{#if details?.website}
						<a
							href={details.website}
							target="_blank"
							rel="noreferrer"
							class="text-sm text-gallery-500 underline decoration-gallery-300 underline-offset-2 hover:text-gallery-800"
						>
							{details.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
						</a>
					{/if}
					{#if details?.socialMedia}
						{@const social = parseSocialLink(details.socialMedia)}
						{#if social}
							<a
								href={social.url}
								target="_blank"
								rel="noreferrer"
								class="text-sm text-gallery-500 underline decoration-gallery-300 underline-offset-2 hover:text-gallery-800"
							>
								{social.label}
							</a>
						{:else}
							<span class="text-sm text-gallery-500">{details.socialMedia}</span>
						{/if}
					{/if}
				</div>
			</div>

			<!-- More Info toggle -->
			{#if hasExpandedContent()}
				<button
					onclick={() => (expanded = !expanded)}
					class="mt-1 flex cursor-pointer items-center gap-1.5 self-start text-sm font-medium text-gallery-500 transition-colors hover:text-gallery-800"
				>
					<span class="inline-block transition-transform duration-200" class:rotate-90={expanded}>
						&#9654;
					</span>
					{expanded ? 'Less info' : 'More info'}
				</button>
			{/if}
		</div>

		<!-- Progress bar -->
		<div class="md:col-span-6">
			<div class="flex items-center gap-3 font-mono text-xs text-gallery-500">
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

		<!-- Expanded details (progressive disclosure) -->
		{#if expanded}
			{#if details?.synopsis}
				<div class="font-semibold md:col-span-1">Synopsis</div>
				<div class="md:col-span-5">
					<p class="leading-relaxed text-gallery-700">{details.synopsis}</p>
				</div>
			{/if}

			{#if details?.castAndCrew}
				<div class="font-semibold md:col-span-1">Cast & Crew</div>
				<div class="text-sm whitespace-pre-line text-gallery-600 md:col-span-5">
					{details.castAndCrew}
				</div>
			{/if}

			{#if details?.thanks}
				<div class="font-semibold md:col-span-1">Thanks</div>
				<div class="text-sm whitespace-pre-line text-gallery-600 md:col-span-5">
					{details.thanks}
				</div>
			{/if}

			{#if currentMiniGraph}
				<MiniGraphSection
					currentFilmId={currentMiniGraph.currentFilmId}
					currentFilmTitle={film.englishTitle}
					currentFilmSlug={currentMiniGraph.currentFilmSlug}
					metaCategories={currentMiniGraph.metaCategories}
					clusters={currentMiniGraph.clusters}
					screenings={currentMiniGraph.screenings}
					neighborFilms={currentMiniGraph.neighborFilms}
				/>
			{/if}
		{/if}

		<!-- Schedule -->
		<div class="md:col-span-6">
			<h2 class="mb-3 text-base font-semibold">Schedule</h2>
			<div class="schedule max-h-80 overflow-y-auto" bind:this={scheduleEl}>
				{#each data.entries as entry, i}
					{#if entry.film}
						{@const status = entryStatus(entry)}
						<a
							data-playing={status === 'playing' ? '' : undefined}
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
