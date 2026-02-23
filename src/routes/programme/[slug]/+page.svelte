<script lang="ts">
	import { onMount } from 'svelte';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import ImageCarousel from '$lib/components/ImageCarousel.svelte';
	import MiniGraphSection from '$lib/components/visualiser/MiniGraphSection.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor } from '$lib/sanity';

	let { data } = $props();
	const film = data.film;

	const screenshotImages = $derived(
		(film.screenshots ?? []).map((s) => ({
			src: urlFor(s).width(800).height(450).fit('crop').url(),
			alt: film.englishTitle
		}))
	);

	const posterUrl = $derived(film.poster ? urlFor(film.poster).width(400).url() : null);

	const showOriginalTitle = $derived(
		film.originalTitle && film.originalTitle !== film.englishTitle
	);

	// Screenings
	type Screening = (typeof data.screenings)[number];

	let now = $state(Date.now());

	onMount(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 60_000);
		return () => clearInterval(interval);
	});

	function parseIso(iso: string): Date {
		let s = iso;
		if (!s.includes('+') && !s.includes('Z')) s += '+01:00';
		s = s.replace(/([+-])(\d)$/, '$10$2:00');
		s = s.replace(/([+-]\d{2})$/, '$1:00');
		return new Date(s);
	}

	function formatTime(iso: string): string {
		return parseIso(iso).toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Europe/Berlin',
			hour12: false
		});
	}

	function formatDayShort(iso: string): string {
		return parseIso(iso).toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			timeZone: 'Europe/Berlin'
		});
	}

	function getBerlinDay(iso: string): string {
		return parseIso(iso).toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
	}

	function screeningStatus(s: Screening): 'past' | 'playing' | 'upcoming' {
		const startMs = parseIso(s.startTime).getTime();
		const endMs = startMs + s.durationSeconds * 1000;
		if (now >= startMs && now < endMs) return 'playing';
		if (now >= endMs) return 'past';
		return 'upcoming';
	}

	const screeningsByDay = $derived(() => {
		const groups: { day: string; label: string; screenings: Screening[] }[] = [];
		const dayMap = new Map<string, Screening[]>();
		for (const s of data.screenings) {
			const day = getBerlinDay(s.startTime);
			if (!dayMap.has(day)) dayMap.set(day, []);
			dayMap.get(day)!.push(s);
		}
		for (const [day, screenings] of dayMap) {
			groups.push({ day, label: formatDayShort(screenings[0].startTime), screenings });
		}
		return groups;
	});
</script>

<SEO
	title={film.englishTitle}
	description={film.synopsis?.slice(0, 160)}
	imageUrl={posterUrl ?? undefined}
/>

<GridLayout>
	<div class="md:col-span-6">
		<a
			href="/programme"
			class="text-sm tracking-wide text-gallery-500 transition-colors hover:text-gallery-700"
		>
			&larr; Back to Programme
		</a>
	</div>

	{#if screenshotImages.length > 0}
		<div class="md:col-span-6">
			<div class="aspect-video w-full overflow-hidden">
				<ImageCarousel images={screenshotImages} />
			</div>
		</div>
	{/if}

	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">
		{film.englishTitle}
		{#if showOriginalTitle}
			<span class="mt-1 block text-lg font-normal text-gallery-500">
				{film.originalTitle}
			</span>
		{/if}
	</h1>

	<div class="font-semibold md:col-span-1">Director</div>
	<div class="md:col-span-4">
		<p>
			{film.directorName}
			{#if film.website}
				<br />
				<a
					href={film.website}
					target="_blank"
					rel="noreferrer"
					class="text-sm underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				>
					{film.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
				</a>
			{/if}
		</p>
	</div>
	<!-- Right column: screenings sidebar (spans all rows on desktop) -->
	<div class="md:col-span-1 md:col-start-6 md:row-span-6">
		{#if posterUrl && screenshotImages.length === 0}
			<div class="mb-6 aspect-3/4">
				<img src={posterUrl} alt={film.englishTitle} class="h-full w-full object-cover" />
			</div>
		{/if}

		{#if data.screenings.length > 0}
			<div class="text-sm">
				<h2 class="mb-3 text-base font-semibold text-gallery-800">Schedule</h2>
				{#each screeningsByDay() as group (group.day)}
					{@const allPast = group.screenings.every((s) => screeningStatus(s) === 'past')}
					<div class="mb-3" class:opacity-30={allPast}>
						<div class="mb-1 text-xs font-medium tracking-wide text-gallery-500 uppercase">
							{group.label}
						</div>
						<div class="flex flex-wrap gap-2">
							{#each group.screenings as screening}
								{@const status = screeningStatus(screening)}
								<div
									class="border-b border-gallery-200/50 bg-gallery-100 py-1.5 font-mono transition-colors
										{status === 'past' && !allPast ? 'opacity-30' : ''}
										{status === 'playing' ? 'font-medium text-gallery-900' : ''}"
								>
									{formatTime(screening.startTime)}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		{#if data.dev}
			<div class="mt-4 flex items-center gap-2 text-xs">
				<span class="text-gallery-500">Source:</span>
				<a
					href="?"
					class="rounded px-2 py-0.5 transition-colors {data.source === 'test'
						? 'bg-gallery-200 text-gallery-900'
						: 'text-gallery-500 hover:text-gallery-700'}"
				>
					Test
				</a>
				<a
					href="?source=production"
					class="rounded px-2 py-0.5 transition-colors {data.source === 'production'
						? 'bg-gallery-200 text-gallery-900'
						: 'text-gallery-500 hover:text-gallery-700'}"
				>
					Production
				</a>
			</div>
		{/if}
	</div>

	<div class="font-semibold md:col-span-1">Details</div>
	<div class="md:col-span-4">
		<p class="text-gallery-600">
			{film.yearOfCompletion}{#if film.length}&ensp;·&ensp;{film.length} min{/if}{#if film.filmLanguage?.length}&ensp;·&ensp;{film.filmLanguage.join(
					', '
				)}{/if}
		</p>
	</div>

	<div class="font-semibold md:col-span-1">Synopsis</div>
	<div class="md:col-span-4">
		<p>{film.synopsis}</p>
	</div>

	{#if film.castAndCrew}
		<div class="font-semibold md:col-span-1">Cast & Crew</div>
		<div class="whitespace-pre-line md:col-span-4">
			{film.castAndCrew}
		</div>
	{/if}

	{#if film.thanks}
		<div class="font-semibold md:col-span-1">Thanks</div>
		<div class="whitespace-pre-line md:col-span-4">
			{film.thanks}
		</div>
	{/if}

	{#if film.explicit}
		<div class="font-semibold md:col-span-1">Content Note</div>
		<div class="md:col-span-4">
			<p class="text-gallery-600">
				This film contains explicit content.{#if film.explicitDetails}
					{film.explicitDetails}{/if}
			</p>
		</div>
	{/if}

	{#if film.previousScreenings && film.previousScreeningLocations}
		<div class="font-semibold md:col-span-1">Previous Screenings</div>
		<div class="whitespace-pre-line md:col-span-4">
			{film.previousScreeningLocations}
		</div>
	{/if}

	{#if data.miniGraph}
		<MiniGraphSection
			currentFilmId={data.miniGraph.currentFilmId}
			currentFilmTitle={film.englishTitle}
			currentFilmSlug={data.miniGraph.currentFilmSlug}
			metaCategories={data.miniGraph.metaCategories}
			clusters={data.miniGraph.clusters}
			neighborFilms={data.miniGraph.neighborFilms}
		/>
	{/if}
</GridLayout>
