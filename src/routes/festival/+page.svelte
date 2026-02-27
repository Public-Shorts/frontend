<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import ImageCarousel from '../../lib/components/ImageCarousel.svelte';
	import ClapButton from '$lib/components/ClapButton.svelte';
	import CommentButton from '$lib/components/CommentButton.svelte';
	import EventCard from '$lib/components/events/EventCard.svelte';
	import GridLayout from '../../lib/components/GridLayout.svelte';
	import Icon from '@iconify/svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor, slugify } from '$lib/sanity';
	import { createClapListener } from '$lib/sanity/realtimeClaps';
	import { getAudioStream } from '$lib/stores/audioStream.svelte';

	let { data } = $props();

	let now = $state(Date.now());
	let clapCounts = $state<Record<string, number>>({ ...data.initialClaps });
	let showAudio = $state(false);
	let clapListener: ReturnType<typeof createClapListener> | null = null;

	onMount(() => {
		const interval = setInterval(() => { now = Date.now(); }, 1000);

		if (browser && !navigator.userAgent.includes('Firefox')) {
			showAudio = data.scheduleEntries.length > 0;
		}

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

	function parseIso(iso: string): Date {
		let s = iso;
		if (!s.includes('+') && !s.includes('Z')) s += '+01:00';
		s = s.replace(/([+-])(\d)$/, '$10$2:00');
		s = s.replace(/([+-]\d{2})$/, '$1:00');
		return new Date(s);
	}

	function formatMMSS(totalSeconds: number): string {
		const s = Math.max(0, Math.floor(totalSeconds));
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	}

	// Find current and previous entries from schedule
	const currentEntry = $derived(() => {
		for (let i = data.scheduleEntries.length - 1; i >= 0; i--) {
			const entry = data.scheduleEntries[i];
			const startMs = parseIso(entry.startTime).getTime();
			const endMs = startMs + entry.durationSeconds * 1000;
			if (now >= startMs && now < endMs) return entry;
		}
		return null;
	});

	const previousEntry = $derived(() => {
		const curr = currentEntry();
		if (!curr) {
			// Nothing playing, find last past entry
			for (let i = data.scheduleEntries.length - 1; i >= 0; i--) {
				const entry = data.scheduleEntries[i];
				const endMs = parseIso(entry.startTime).getTime() + entry.durationSeconds * 1000;
				if (now >= endMs && entry.film) return entry;
			}
			return null;
		}
		// Find the entry just before current with a different film
		const currIdx = data.scheduleEntries.indexOf(curr);
		for (let i = currIdx - 1; i >= 0; i--) {
			const entry = data.scheduleEntries[i];
			if (entry.film && entry.film._id !== curr.film?._id) return entry;
		}
		return null;
	});

	const currentProgress = $derived(() => {
		const curr = currentEntry();
		if (!curr) return { fraction: 0, elapsed: 0, remaining: 0 };
		const startMs = parseIso(curr.startTime).getTime();
		const elapsed = (now - startMs) / 1000;
		const remaining = curr.durationSeconds - elapsed;
		const fraction = Math.min(1, Math.max(0, elapsed / curr.durationSeconds));
		return { fraction, elapsed, remaining };
	});

	// Next upcoming entry (when nothing is playing)
	const nextUpEntry = $derived(() => {
		if (currentEntry()) return null;
		for (const entry of data.scheduleEntries) {
			const startMs = parseIso(entry.startTime).getTime();
			if (now < startMs && entry.film) return entry;
		}
		return null;
	});

	// Unified display: current or next-up
	const displayEntry = $derived(() => currentEntry() ?? nextUpEntry() ?? null);

	function entryImageUrl(entry: NonNullable<ReturnType<typeof currentEntry>>): string | null {
		if (!entry?.film) return null;
		if (entry.film.poster) return urlFor(entry.film.poster).width(600).height(800).fit('crop').url();
		if (entry.film.screenshot) return urlFor(entry.film.screenshot).width(800).height(450).fit('crop').url();
		return null;
	}

	function filmThumbnailUrl(entry: NonNullable<ReturnType<typeof currentEntry>>): string | null {
		if (!entry?.film) return null;
		if (entry.film.screenshot) return urlFor(entry.film.screenshot).width(400).height(225).fit('crop').url();
		if (entry.film.poster) return urlFor(entry.film.poster).width(300).height(400).fit('crop').url();
		return null;
	}

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const selectionImages = $derived(
		data.selection.topScreenshots.map((s) => ({
			src: urlFor(s.screenshot).width(600).height(338).fit('crop').url(),
			alt: s.alt
		}))
	);

	const totalHours = $derived(Math.floor(data.selection.totalMinutes / 60));
	const remainingMinutes = $derived(data.selection.totalMinutes % 60);
</script>

<SEO />

<GridLayout>
	<h1 class=" text-3xl font-bold md:col-span-5 md:col-start-2">Festival</h1>

	{#if data.scheduleEntries.length > 0 && displayEntry()?.film}
		{@const entry = displayEntry()!}
		{@const film = entry.film!}
		{@const isPlaying = !!currentEntry()}
		{@const prev = previousEntry()}
		{@const img = entryImageUrl(entry)}
		{@const p = isPlaying ? currentProgress() : { fraction: 0, elapsed: 0, remaining: entry.durationSeconds }}
		<div class="font-semibold md:col-span-1">Now Playing</div>
		<div class="md:col-span-5">
			<div class="{isPlaying ? '' : 'pointer-events-none opacity-50 grayscale'} border-l-2 {isPlaying ? 'border-accent-500 bg-white/60' : 'border-gallery-300 bg-gallery-100/50'} px-4 py-5">
				<div class="grid grid-cols-1 gap-5 md:grid-cols-5">
					{#if !isPlaying}
						<p class="text-sm text-gallery-500 md:hidden">Up Next</p>
					{/if}
					{#if img}
						<div class="md:col-span-2">
							<img
								src={img}
								alt={film.englishTitle}
								class="w-full object-cover {film.poster ? 'aspect-3/4' : 'aspect-video'}"
							/>
						</div>
					{/if}
					<div class="relative flex flex-col gap-2 {img ? 'md:col-span-3' : 'md:col-span-5'}">
						{#if !isPlaying}
							<p class="absolute -top-5 left-0 hidden text-sm text-gallery-500 md:block">Up Next</p>
						{/if}
						<h3 class="text-2xl font-bold">
							<a
								href="/programme/{slugify(film.englishTitle)}"
								class="transition-colors hover:text-accent-500"
							>
								{film.englishTitle}
							</a>
						</h3>
						<div class="flex items-baseline gap-x-4 gap-y-1">
							<p class="text-gallery-500">{film.directorName} · {film.length} min</p>
							<div class="flex items-baseline gap-1">
								<ClapButton filmId={film._id} totalClaps={clapCounts[film._id] ?? 0} disabled={!isPlaying} />
								<CommentButton filmId={film._id} />
							</div>
						</div>
					</div>

					<!-- Progress bar -->
					<div class="md:col-span-5">
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
				</div>
			</div>

			<!-- Previous -->
			{#if prev?.film}
				{@const prevFilm = prev.film}
				{@const thumb = filmThumbnailUrl(prev)}
				<div class="mt-4">
					<h4 class="mb-2 text-sm font-semibold text-gallery-500">Previous</h4>
					<div class="flex gap-3 text-gallery-400">
						{#if thumb}
							<a href="/programme/{slugify(prevFilm.englishTitle)}" class="shrink-0">
								<img
									src={thumb}
									alt={prevFilm.englishTitle}
									class="h-18 w-32 object-cover opacity-60 grayscale"
								/>
							</a>
						{/if}
						<div class="min-w-0 flex-1">
							<a
								href="/programme/{slugify(prevFilm.englishTitle)}"
								class="truncate transition-colors hover:text-accent-500"
							>
								{prevFilm.englishTitle}
							</a>
							<p class="mt-0.5 text-xs text-gallery-500">{prevFilm.directorName}</p>
							<div class="mt-1 flex items-center gap-1">
								<ClapButton filmId={prevFilm._id} totalClaps={clapCounts[prevFilm._id] ?? 0} />
								<CommentButton filmId={prevFilm._id} />
							</div>
						</div>
					</div>
				</div>
			{/if}

			<p class="mt-4">
				<a
					href="/live"
					class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				>
					Full live experience
				</a>
			</p>
		</div>
	{/if}

	<div class="font-semibold md:col-span-1">Concept</div>
	<div class="md:col-span-3">
		Public Shorts is an experimental – 24/7 video festival – taking place in Berlin from February 27
		to March 15, 2026. From the wide and inclusive open-call, through the collective curation
		process, and all the way to the public viewing display, Public Shorts aims to rethink what
		public art can be.
	</div>
	<div class="content cover aspect-3/4 md:col-span-2 md:row-span-2">
		<ImageCarousel
			images={[
				{ src: '/images/Pictures/window/window-pics-02.png', alt: 'Window at Kanapé with CRT-TV' },
				{ src: '/images/Pictures/window/window-pics-01.png', alt: 'Window at Kanapé with CRT-TV' },
				{ src: '/images/Pictures/window/window-pics-03.png', alt: 'Window at Kanapé with CRT-TV' },
				{ src: '/images/Pictures/window/window-pics-04.png', alt: 'Window at Kanapé with CRT-TV' }
			]}
		/>
	</div>

	<div class="font-semibold md:col-span-1">24/7 Program</div>
	<div class="md:col-span-3">
		Throughout the festival, the curated selection plays on loop on screens visible through the
		glass windows at
		<a
			class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
			href="https://maps.app.goo.gl/ik5tm9Xrx9MPuDnRA"
			target="_blank"
			rel="noreferrer"
		>
			Hobrechstraße 54, 12047 Berlin
		</a>, accessible to anyone passing by at any time of day or night. The public is also invited to
		engage with the festival as an active participant, and review the videos.
	</div>

	{#if data.selection.totalFilms > 0}
		<div class="font-semibold md:col-span-1">Selection</div>
		<div class="md:col-span-3">
			<p>
				From open-call submissions, our curatorial team collectively selected
				{data.selection.totalFilms} short films totaling {totalHours}h{remainingMinutes}m of
				programming, with an average runtime of ~{data.selection.avgMinutes} minutes per film. The selection
				spans
				{data.selection.topCategories.slice(0, 5).join(', ').toLowerCase()}, and more.
			</p>
			<p class="mt-3">
				<a
					href="/programme"
					class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
					>Full programme</a
				>
				&middot;
				<a
					href="/schedule"
					class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
					>Schedule</a
				>
			</p>
		</div>
		{#if selectionImages.length > 0}
			<div class="aspect-video md:col-span-2">
				<ImageCarousel images={selectionImages.reverse()} />
			</div>
		{/if}
	{/if}

	<div class="font-semibold md:col-span-1">Map</div>
	<div class="md:col-span-3">
		A visual map of the entire selection, organized by thematic clusters and curator tags. Explore
		how the films relate to each other and navigate the programme spatially.
		<a
			href="/programme/map"
			class="mt-1 inline-block underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
		>
			Open the interactive map
		</a>
	</div>
	<div class="md:col-span-2">
		<a href="/programme/map" class="block overflow-hidden rounded">
			<img
				src="/programme-map.png"
				alt="Programme map showing thematic clusters of selected films"
				width="976"
				height="963"
				loading="lazy"
				decoding="async"
				class="h-auto w-full transition-opacity hover:opacity-90"
			/>
		</a>
	</div>

	{#if data.screenings.length > 0}
		<div class="font-semibold md:col-span-1">Events</div>
		<div class="md:col-span-5">
			<p>
				In addition to the continuous display in the window, special in-person events feature
				Q&amp;As, debates, and discussions:
			</p>
			<div class="mt-4 grid gap-4">
				{#each data.screenings as screening}
					<div class={new Date(screening.date).getTime() < now ? 'opacity-40' : ''}>
						<EventCard
							title={screening.title}
							date={formatDate(screening.date)}
							location={screening.location}
							href="/events/{screening.slug}"
						/>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="font-semibold md:col-span-1">Open Call</div>
	<div class="md:col-span-3">
		All types of video media under 15 minutes, made in the past 3 years are welcome. The festival is
		curated by a diverse team of curators who collectively shape the selection. See the
		<a
			href="/opencall"
			class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
			>open call</a
		>
		for the 2026 edition.
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	<div class="font-semibold md:col-span-1">Team</div>
	<div class="md:col-span-3">
		Célestin Meunier, Manus Nijhoff, Sena Doğan, Lilli Grube, and Su Durakbaşa.
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	{#if data.curators.length > 0}
		<div class="font-semibold md:col-span-1">Curatorial Team</div>
		<div class="md:col-span-3">
			{data.curators.map((c) => c.name).join(', ')}.
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}

	<div class="font-semibold md:col-span-1">
		Meta Jury
		<span class="group relative ml-1 inline-block cursor-help align-middle">
			<Icon icon="ri:question-line" width="18" class=" text-gallery-500" />
			<span
				class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-48 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs font-normal text-white opacity-0 transition-opacity group-hover:opacity-100"
			>
				The Meta Jury doesnt select the films, but rather shapes the infrastructure of the
				festival's curation process.
			</span>
		</span>
	</div>
	<div class="md:col-span-3">
		<a href="https://jamieallen.com/">Jamie Allen</a>,
		<a href="https://getaphilosopher.com/luce_delire/">Luce Delire</a>,
		<a href="https://www.fischerelsani.net/">Nina Fischer</a>,
		<a href="https://www.schoolofma.org/people/rachel-uwa">Rachel Uwa</a>, and
		<a href="https://www.fwuest.com/"> Florian Wüst</a>.
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	<div class="font-semibold md:col-span-1">Thanks</div>
	<div class="md:col-span-3">
		Thanks to <a href="https://kollektiv.kanape.studio/">Kanapé</a> for hosting and the technical
		support, and to all our
		<a
			href="/partners"
			class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
		>
			partners
		</a>
		and supporters, and to all the artists submitting their works. Thank you to
		<a href="https://bgo.la/">Bruno Gola</a>
		for his technical support. Special thanks to
		<a href="https://www.fwuest.com/"> Florian Wüst </a>
		for his support and advising throughout the whole process.
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	<div class="font-semibold md:col-span-1">Donation</div>
	<div class="md:col-span-3">
		Donations help support the festival and its activities. You can donate via PayPal at
		<a
			href="https://paypal.me/publicshorts"
			class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
			target="_blank"
			rel="noreferrer"
		>
			paypal.me/publicshorts
		</a>.
	</div>
	<div class="hidden md:col-span-2 md:block"></div>
</GridLayout>
