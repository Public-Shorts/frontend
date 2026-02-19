<script lang="ts">
	import ImageCarousel from '../../lib/components/ImageCarousel.svelte';

	import EventCard from '$lib/components/events/EventCard.svelte';
	import GridLayout from '../../lib/components/GridLayout.svelte';
	import Icon from '@iconify/svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor } from '$lib/sanity';

	let { data } = $props();

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
				From over 400 open-call submissions, our curatorial team collectively selected
				{data.selection.totalFilms} short films totaling {totalHours}h{remainingMinutes}m of programming,
				with an average runtime of ~{data.selection.avgMinutes} minutes per film. The selection spans
				{data.selection.topCategories.slice(0, 5).join(', ').toLowerCase()}, and more.
			</p>
			<p class="mt-3">
				<a href="/programme" class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900">Full programme</a>
				&middot;
				<a href="/programme/map" class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900">Map</a>
				&middot;
				<a href="/schedule" class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900">Schedule</a>
			</p>
		</div>
		{#if selectionImages.length > 0}
			<div class="aspect-video md:col-span-2">
				<ImageCarousel images={selectionImages} />
			</div>
		{/if}
	{/if}

	{#if data.screenings.length > 0}
		<div class="font-semibold md:col-span-1">Events</div>
		<div class="md:col-span-3">
			In addition to the continuous display in the window, special in-person events feature
			Q&amp;As, debates, and discussions:
		</div>
		<div class="md:col-span-2">
			<div class="grid gap-4 md:grid-cols-1">
				{#each data.screenings as screening}
					<EventCard
						title={screening.title}
						date={formatDate(screening.date)}
						location={screening.location}
						href="/events/{screening.slug}"
					/>
				{/each}
			</div>
		</div>
	{/if}

	<div class="font-semibold md:col-span-1">Open Call</div>
	<div class="md:col-span-3">
		All types of video media under 15 minutes, made in the past 3 years are welcome. The festival is
		curated by a diverse team of curators who collectively shape the selection. See the
		<a href="/opencall" class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900">open call</a>
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
		<a href="https://bgo.la/">Bruno Goal</a>
		for his technical support. Special thanks to
		<a href="https://www.fwuest.com/"> Florian Wüst </a>
		for his support and advising throughout the whole process. We
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
