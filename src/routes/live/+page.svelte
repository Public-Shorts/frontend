<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import MiniGraphSection from '$lib/components/visualiser/MiniGraphSection.svelte';
	import ClapButton from '$lib/components/ClapButton.svelte';
	import CommentButton from '$lib/components/CommentButton.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor, slugify } from '$lib/sanity';
	import { createClapListener } from '$lib/sanity/realtimeClaps';

	let { data } = $props();

	type Entry = (typeof data.entries)[number];

	let now = $state(Date.now());
	let expanded = $state(false);
	let scheduleEl = $state<HTMLDivElement>();
	let clapCounts = $state<Record<string, number>>({ ...data.initialClaps });

	let clapListener: ReturnType<typeof createClapListener> | null = null;

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
			scheduleEl.scrollTop =
				el.offsetTop - scheduleEl.offsetTop - scheduleEl.clientHeight / 2 + el.clientHeight / 2;
		});

		// Start realtime clap listener
		clapListener = createClapListener(data.initialClaps);
		const unsubscribe = clapListener.subscribe((claps) => {
			const updated: Record<string, number> = {};
			for (const [k, v] of claps) updated[k] = v;
			clapCounts = updated;
		});

		return () => {
			clearInterval(interval);
			unsubscribe();
			clapListener?.destroy();
		};
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

	// Previous film (1 entry, different film ID from current)
	const previousEntry = $derived(() => {
		const startIdx = currentIndex >= 0 ? currentIndex - 1 : data.entries.length - 1;
		for (let i = startIdx; i >= 0; i--) {
			const entry = data.entries[i];
			if (entry.film && entry.film._id !== currentEntry?.film?._id) return entry;
		}
		return null;
	});

	// "Between films" state
	const betweenFilms = $derived(() => {
		if (currentEntry) return null;
		let lastPast: Entry | null = null;
		let nextUp: Entry | null = null;
		for (let i = data.entries.length - 1; i >= 0; i--) {
			const status = entryStatus(data.entries[i]);
			if (status === 'past' && !lastPast) lastPast = data.entries[i];
		}
		for (const entry of data.entries) {
			if (entryStatus(entry) === 'upcoming') {
				nextUp = entry;
				break;
			}
		}
		return { lastPast, nextUp };
	});

	// Clappable films: current + past 3
	const clappableFilmIds = $derived(() => {
		const ids = new Set<string>();
		if (currentEntry?.film) ids.add(currentEntry.film._id);
		const prev = previousEntry();
		if (prev?.film) ids.add(prev.film._id);
		// Also include 2 more past entries for the schedule clap counts
		let count = prev ? 1 : 0;
		const startIdx = currentIndex >= 0 ? currentIndex - 1 : data.entries.length - 1;
		for (let i = startIdx; i >= 0 && count < 3; i--) {
			const entry = data.entries[i];
			if (entry.film && !ids.has(entry.film._id)) {
				ids.add(entry.film._id);
				count++;
			}
		}
		return ids;
	});

	// Commentable: current + previous only
	const commentableFilmIds = $derived(() => {
		const ids = new Set<string>();
		if (currentEntry?.film) ids.add(currentEntry.film._id);
		const prev = previousEntry();
		if (prev?.film) ids.add(prev.film._id);
		return ids;
	});

	// Reset expanded when film changes
	let lastFilmId = $state<string | null>(null);
	$effect(() => {
		const id = currentEntry?.film?._id ?? null;
		if (id !== lastFilmId) {
			expanded = false;
			lastFilmId = id;
		}
	});

	const scheduleEntries = $derived(() => {
		if (currentIndex >= 0) {
			const startIdx = Math.max(0, currentIndex - 3);
			return data.entries.slice(startIdx);
		}
		return data.entries.slice(-3);
	});

	const hasExpandedContent = $derived(() => {
		if (!currentDetails) return false;
		return !!(
			currentDetails.castAndCrewPlain ||
			currentDetails.thanksPlain ||
			currentMiniGraph
		);
	});

	function filmThumbnailUrl(entry: Entry): string | null {
		if (!entry.film) return null;
		if (entry.film.screenshot) return urlFor(entry.film.screenshot).width(400).height(225).fit('crop').url();
		if (entry.film.poster) return urlFor(entry.film.poster).width(300).height(400).fit('crop').url();
		return null;
	}

	function entryImageUrl(entry: Entry): string | null {
		if (!entry.film) return null;
		if (entry.film.poster) return urlFor(entry.film.poster).width(600).height(800).fit('crop').url();
		if (entry.film.screenshot) return urlFor(entry.film.screenshot).width(800).height(450).fit('crop').url();
		return null;
	}
</script>

<SEO
	title="Now Playing"
	description="See what's currently playing on the Public Shorts 24/7 video loop."
/>

<GridLayout>
	<!-- {#if data.dev || data.source === 'test'}
		<div class="md:col-span-6">
			<div class="flex items-center gap-2 text-sm">
				<span class="text-gallery-500">Source:</span>
				<a
					href="/live?source=test"
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
	{/if} -->

	{#if currentEntry?.film}
		{@const film = currentEntry.film}
		{@const details = currentDetails}
		{@const p = progress()}
		{@const img = imageUrl()}

		<!-- Current film block with accented background -->
		<div class="relative -mx-4 md:col-span-6 md:-mx-8">
			<div class="border-l-2 border-accent-500 bg-white/60 px-4 py-6 md:px-8">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-6">
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
					<div class="flex flex-col gap-3 {img ? 'md:col-span-4' : 'md:col-span-6'}">
						<!-- Title row with inline clap + comment -->
						<div class="flex flex-wrap items-start gap-x-4 gap-y-2">
							<div class="min-w-0 flex-1">
								<h1 class="text-3xl font-bold">
									<a
										href="/programme/{slugify(film.englishTitle)}"
										class="transition-colors hover:text-accent-500"
									>
										{film.englishTitle}
									</a>
								</h1>
							</div>
							<div class="flex items-center gap-1">
								<ClapButton filmId={film._id} totalClaps={clapCounts[film._id] ?? 0} showLabel />
								{#if commentableFilmIds().has(film._id)}
									<CommentButton filmId={film._id} showLabel />
								{/if}
							</div>
						</div>

						<p class="text-lg text-gallery-500">
							{#if showOriginalTitle}
								{film.originalTitle + ' · '}
							{/if}
							{film.length} min
						</p>

						<div>
							<p class="font-semibold">{film.directorName}</p>
							<div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
								{#each details?.website ?? [] as link}
									<a
										href={link.url}
										target="_blank"
										rel="noreferrer"
										class="text-sm text-gallery-500 underline decoration-gallery-300 underline-offset-2 hover:text-gallery-800"
									>
										{link.label || link.url}
									</a>
								{/each}
								{#each details?.socialMedia ?? [] as link}
									<a
										href={link.url}
										target="_blank"
										rel="noreferrer"
										class="text-sm text-gallery-500 underline decoration-gallery-300 underline-offset-2 hover:text-gallery-800"
									>
										{link.label || link.url}
									</a>
								{/each}
							</div>
						</div>

						{#if details?.synopsisPlain}
							<p class="text-sm leading-relaxed text-gallery-600">{details.synopsisPlain}</p>
						{/if}

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

						{#if expanded}
							{#if details?.castAndCrewPlain}
								<div>
									<p class="text-xs font-semibold text-gallery-500">Cast & Crew</p>
									<p class="mt-0.5 text-sm whitespace-pre-line text-gallery-600">{details.castAndCrewPlain}</p>
								</div>
							{/if}

							{#if details?.thanksPlain}
								<div>
									<p class="text-xs font-semibold text-gallery-500">Thanks</p>
									<p class="mt-0.5 text-sm whitespace-pre-line text-gallery-600">{details.thanksPlain}</p>
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
					</div>
				</div>
			</div>
		</div>

		<!-- Previous -->
		{#if previousEntry()?.film}
			{@const prev = previousEntry()!}
			{@const thumb = filmThumbnailUrl(prev)}
			<div class="md:col-span-6">
				<h2 class="mb-3 text-sm font-semibold text-gallery-500">Previous</h2>
				<div class="text-gallery-400">
					<div class="flex gap-3">
						{#if thumb}
							<a href="/programme/{slugify(prev.film!.englishTitle)}" class="shrink-0">
								<img
									src={thumb}
									alt={prev.film!.englishTitle}
									class="h-14 w-22 rounded object-cover opacity-60 grayscale"
								/>
							</a>
						{/if}
						<div class="min-w-0 flex-1">
							<a
								href="/programme/{slugify(prev.film!.englishTitle)}"
								class="truncate transition-colors hover:text-accent-500"
							>
								{prev.film!.englishTitle}
							</a>
							<p class="mt-0.5 text-xs text-gallery-500">{prev.film!.directorName}</p>
							<div class="mt-1 flex items-center gap-1">
								<ClapButton
									filmId={prev.film!._id}
									totalClaps={clapCounts[prev.film!._id] ?? 0}
								/>
								{#if commentableFilmIds().has(prev.film!._id)}
									<CommentButton filmId={prev.film!._id} />
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Upcoming -->
		<div class="md:col-span-6">
			<h2 class="mb-3 text-sm font-semibold text-gallery-500">Upcoming</h2>
			<div class="schedule max-h-80 overflow-y-auto" bind:this={scheduleEl}>
				{#each scheduleEntries() as entry}
					{#if entry.film && entryStatus(entry) === 'upcoming'}
						<a
							href="/programme/{slugify(entry.film.englishTitle)}"
							class="flex items-baseline gap-4 border-b border-gallery-200/50 py-2 text-sm text-gallery-600 transition-colors hover:text-accent-500"
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
		<!-- Between films / nothing playing -->
		{@const bf = betweenFilms()}

		{#if bf?.nextUp?.film}
			{@const film = bf.nextUp.film}
			{@const img = entryImageUrl(bf.nextUp)}
			<!-- Upcoming film — same layout as current but greyed out -->
			<div class="relative -mx-4 opacity-50 grayscale md:col-span-6 md:-mx-8">
				<div class="border-l-2 border-gallery-300 bg-gallery-100/50 px-4 py-6 md:px-8">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-6">
						{#if img}
							<div class="md:col-span-2">
								<img
									src={img}
									alt={film.englishTitle}
									class="w-full object-cover {film.poster ? 'aspect-3/4' : 'aspect-video'}"
								/>
							</div>
						{/if}

						<div class="flex flex-col gap-3 {img ? 'md:col-span-4' : 'md:col-span-6'}">
							<div>
								<p class="mb-1 text-sm text-gallery-500">Up Next</p>
								<h1 class="text-3xl font-bold">{film.englishTitle}</h1>
								<p class="mt-1 text-lg text-gallery-500">
									{film.length} min
								</p>
							</div>
							<p class="font-semibold">{film.directorName}</p>
						</div>

						<!-- Empty progress bar -->
						<div class="md:col-span-6">
							<div class="flex items-center gap-3 font-mono text-xs text-gallery-400">
								<span>00:00</span>
								<div class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gallery-200"></div>
								<span>-{formatMMSS(bf.nextUp.durationSeconds)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
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

		{#if bf?.lastPast?.film}
			{@const film = bf.lastPast.film}
			{@const thumb = filmThumbnailUrl(bf.lastPast)}
			<!-- Previous film -->
			<div class="md:col-span-6">
				<h2 class="mb-3 text-sm font-semibold text-gallery-500">Previous</h2>
				<div class="flex gap-4">
					{#if thumb}
						<a href="/programme/{slugify(film.englishTitle)}" class="shrink-0">
							<img
								src={thumb}
								alt={film.englishTitle}
								class="h-16 w-24 rounded object-cover"
							/>
						</a>
					{/if}
					<div class="min-w-0 flex-1">
						<h3 class="font-medium">
							<a
								href="/programme/{slugify(film.englishTitle)}"
								class="transition-colors hover:text-accent-500"
							>
								{film.englishTitle}
							</a>
						</h3>
						<p class="text-sm text-gallery-500">{film.directorName}</p>
						<div class="mt-1.5 flex items-center gap-1">
							<ClapButton
								filmId={film._id}
								totalClaps={clapCounts[film._id] ?? 0}
								showLabel
							/>
							<CommentButton filmId={film._id} showLabel />
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Schedule (between films) -->
		<div class="md:col-span-6">
			<h2 class="mb-3 text-base font-semibold">Schedule</h2>
			<div class="schedule max-h-80 overflow-y-auto" bind:this={scheduleEl}>
				{#each scheduleEntries() as entry}
					{#if entry.film}
						{@const status = entryStatus(entry)}
						<a
							data-playing={status === 'playing' ? '' : undefined}
							href="/programme/{slugify(entry.film.englishTitle)}"
							class="flex items-baseline gap-4 border-b border-gallery-200/50 py-2 text-sm transition-colors
								{status === 'past'
								? 'opacity-30'
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
	{/if}
</GridLayout>

<style>
	.schedule a {
		text-decoration: none;
	}
</style>
