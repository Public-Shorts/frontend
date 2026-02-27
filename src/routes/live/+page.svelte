<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import MiniGraphSection from '$lib/components/visualiser/MiniGraphSection.svelte';
	import ClapButton from '$lib/components/ClapButton.svelte';
	import CommentButton from '$lib/components/CommentButton.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import Icon from '@iconify/svelte';
	import { urlFor, slugify } from '$lib/sanity';
	import { createClapListener } from '$lib/sanity/realtimeClaps';
	import { getAudioStream } from '$lib/stores/audioStream.svelte';

	let { data } = $props();

	type Entry = (typeof data.entries)[number];

	let now = $state(Date.now());
	let expanded = $state(false);
	let scheduleEl = $state<HTMLDivElement>();
	let clapCounts = $state<Record<string, number>>({ ...data.initialClaps });

	let showAudio = $state(data.dev);
	let clapListener: ReturnType<typeof createClapListener> | null = null;

	onMount(() => {
		if (browser && navigator.userAgent.includes('Firefox')) {
			showAudio = false;
		} else if (!data.dev) {
			showAudio = data.entries.length > 0;
		}

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

	// Unified display: current playing film, or next upcoming
	const displayEntry = $derived(() => {
		if (currentEntry) return currentEntry;
		return betweenFilms()?.nextUp ?? null;
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
	{#if displayEntry()?.film}
		{@const entry = displayEntry()!}
		{@const film = entry.film!}
		{@const isPlaying = !!currentEntry}
		{@const details = isPlaying ? currentDetails : (data.filmDetailsMap[film._id] ?? null)}
		{@const img = entryImageUrl(entry)}
		{@const p = isPlaying ? progress() : { fraction: 0, elapsed: 0, remaining: entry.durationSeconds }}

		<!-- Main film block — identical structure for playing & up-next -->
		<div class="relative -mx-4 md:col-span-6 md:-mx-8 {isPlaying ? '' : 'pointer-events-none opacity-50 grayscale'}">
			<div class="border-l-2 {isPlaying ? 'border-accent-500 bg-white/60' : 'border-gallery-300 bg-gallery-100/50'} px-4 py-6 md:px-8">
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
						{#if !isPlaying}
							<p class="text-sm text-gallery-500">Up Next</p>
						{/if}
						<h1 class="text-3xl font-bold">
							<a
								href="/programme/{slugify(film.englishTitle)}"
								class="transition-colors hover:text-accent-500"
							>
								{film.englishTitle}
							</a>
						</h1>

						<div class="flex items-baseline gap-x-4 gap-y-1">
							<p class="text-lg text-gallery-500">
								{#if film.originalTitle && film.originalTitle !== film.englishTitle}
									{film.originalTitle + ' · '}
								{/if}
								{film.length} min
							</p>
							<div class="flex items-baseline gap-1">
								<ClapButton filmId={film._id} totalClaps={clapCounts[film._id] ?? 0} showLabel disabled={!isPlaying} />
								<CommentButton filmId={film._id} showLabel />
							</div>
						</div>

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

					</div>

					<!-- Progress bar -->
					<div class="md:col-span-6">
						<div class="flex items-center gap-3 font-mono text-xs text-gallery-500">
							<span>{formatMMSS(p.elapsed)}</span>
							<div class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gallery-200">
								{#if isPlaying}
									<div
										class="absolute inset-y-0 left-0 rounded-full bg-accent-500 transition-[width] duration-1000 ease-linear"
										style:width="{p.fraction * 100}%"
									></div>
								{/if}
							</div>
							<span>-{formatMMSS(p.remaining)}</span>
							{#if showAudio}
								{@const audio = getAudioStream()}
								<button
									onclick={audio.toggle}
									class="flex items-center gap-1.5 text-gallery-500 transition-colors hover:text-gallery-800"
									aria-label={audio.status === 'connected' || audio.status === 'connecting' ? 'Disconnect live audio' : 'Tune in to live audio'}
								>
									{#if audio.status === 'connected'}
										<Icon icon="ri:volume-up-line" width="16" class="text-green-600" />
									{:else if audio.status === 'connecting'}
										<Icon icon="ri:loader-4-line" width="16" class="animate-spin" />
									{:else}
										<Icon icon="ri:volume-mute-line" width="16" />
										<span class="font-sans text-xs">Tune in</span>
									{/if}
								</button>
							{/if}
						</div>
					</div>

					<!-- More Info -->
					{#if details?.castAndCrewPlain || details?.thanksPlain || (isPlaying && currentMiniGraph)}
						<div class="md:col-span-6">
							<button
								onclick={() => (expanded = !expanded)}
								class="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gallery-500 transition-colors hover:text-gallery-800"
							>
								<span class="inline-block transition-transform duration-200" class:rotate-90={expanded}>
									&#9654;
								</span>
								{expanded ? 'Less info' : 'More info'}
							</button>

							{#if expanded}
								<div class="mt-3 flex flex-col gap-4">
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

									{#if isPlaying && currentMiniGraph}
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
								</div>
							{/if}
						</div>
					{/if}
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
									class="h-18 w-32 object-cover opacity-60 grayscale"
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

		<!-- Schedule -->
		<div class="md:col-span-6">
			<h2 class="mb-3 text-sm font-semibold text-gallery-500">{isPlaying ? 'Upcoming' : 'Schedule'}</h2>
			<div class="schedule max-h-80 overflow-y-auto" bind:this={scheduleEl}>
				{#each scheduleEntries() as entry}
					{#if entry.film}
						{@const status = entryStatus(entry)}
						{#if isPlaying ? status === 'upcoming' : true}
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
					{/if}
				{/each}
			</div>
		</div>

	{:else}
		<!-- Nothing playing, nothing upcoming -->
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
