<script lang="ts">
	import GridLayout from '$lib/components/GridLayout.svelte';
	import ImageCarousel from '$lib/components/ImageCarousel.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor } from '$lib/sanity';

	let { data } = $props();
	const film = data.film;

	const categoryLabels: Record<string, string> = {
		abstract: 'Abstract',
		animation: 'Animation',
		comedy: 'Comedy',
		dance: 'Dance',
		documentary: 'Documentary',
		environment: 'Environment / Nature',
		experimental: 'Experimental',
		horror: 'Horror',
		lgbtqia: 'LGBTQIA+',
		mobile: 'Mobile',
		micro: 'Micro-Short',
		music_video: 'Music Video',
		narrative: 'Narrative',
		performance: 'Performance',
		sci_fi_fantasy: 'Sci-Fi / Fantasy',
		social_impact: 'Social Impact',
		technology: 'Technology',
		urban: 'Urban',
		silent_visual: 'Visual-Only',
		other: 'Other'
	};

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
	<div class="md:col-span-3">
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
	{#if posterUrl && screenshotImages.length === 0}
		<div class="row-span-3 aspect-3/4 md:col-span-2">
			<img src={posterUrl} alt={film.englishTitle} class="h-full w-full object-cover" />
		</div>
	{:else}
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}

	<div class="font-semibold md:col-span-1">Details</div>
	<div class="md:col-span-3">
		<p class="text-gallery-600">
			{film.yearOfCompletion}{#if film.length}&ensp;·&ensp;{film.length} min{/if}{#if film.filmLanguage?.length}&ensp;·&ensp;{film.filmLanguage.join(', ')}{/if}
		</p>
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	<div class="font-semibold md:col-span-1">Synopsis</div>
	<div class="md:col-span-3">
		<p>{film.synopsis}</p>
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	{#if film.categories?.length}
		<div class="font-semibold md:col-span-1">Categories</div>
		<div class="md:col-span-3">
			<div class="flex flex-wrap gap-2">
				{#each film.categories as cat}
					<span
						class="rounded-sm border border-gallery-300 px-2 py-0.5 text-sm text-gallery-600"
					>
						{categoryLabels[cat] ?? cat}
					</span>
				{/each}
			</div>
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}

	{#if film.castAndCrew}
		<div class="font-semibold md:col-span-1">Cast & Crew</div>
		<div class="md:col-span-3 whitespace-pre-line">
			{film.castAndCrew}
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}

	{#if film.thanks}
		<div class="font-semibold md:col-span-1">Thanks</div>
		<div class="md:col-span-3 whitespace-pre-line">
			{film.thanks}
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}

	{#if film.explicit}
		<div class="font-semibold md:col-span-1">Content Note</div>
		<div class="md:col-span-3">
			<p class="text-gallery-600">
				This film contains explicit content.{#if film.explicitDetails} {film.explicitDetails}{/if}
			</p>
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}

	{#if film.previousScreenings && film.previousScreeningLocations}
		<div class="font-semibold md:col-span-1">Previous Screenings</div>
		<div class="md:col-span-3 whitespace-pre-line">
			{film.previousScreeningLocations}
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}
</GridLayout>
