<script lang="ts">
	import GridLayout from '$lib/components/GridLayout.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor, slugify } from '$lib/sanity';

	let { data } = $props();
	const screening = data.screening;

	const eventDate = $derived(() => {
		const d = new Date(screening.date);
		return {
			full: d.toLocaleDateString('en-GB', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			}),
			time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
		};
	});

	function getFilmImageUrl(film: NonNullable<typeof screening.films>[0]): string | null {
		const source = film.poster ?? film.screenshot;
		if (!source) return null;
		return urlFor(source).width(600).height(338).fit('crop').url();
	}
</script>

<SEO title={screening.title} description={screening.descriptionPlain ?? undefined} />

<GridLayout>
	<div class="md:col-span-6">
		<a
			href="/events"
			class="text-sm tracking-wide text-gallery-500 transition-colors hover:text-gallery-700"
		>
			&larr; Back to Events
		</a>
	</div>

	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">
		{screening.title}
	</h1>

	{#if screening.coverImage}
		<div class="md:col-span-6">
			<img
				src={urlFor(screening.coverImage).width(1920).url()}
				alt={screening.title}
				class="h-auto w-full"
				loading="lazy"
				decoding="async"
			/>
		</div>
	{/if}

	<div class="font-semibold md:col-span-1">Date</div>
	<div class="md:col-span-3">
		<p>{eventDate().full}, {eventDate().time}</p>
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	<div class="font-semibold md:col-span-1">Location</div>
	<div class="md:col-span-3">
		<p>{screening.location}</p>
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	{#if screening.language}
		<div class="font-semibold md:col-span-1">Language</div>
		<div class="md:col-span-3">
			<p>{screening.language}</p>
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}

	{#if screening.duration}
		<div class="font-semibold md:col-span-1">Duration</div>
		<div class="md:col-span-3">
			<p>{screening.duration}</p>
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}

<div class="font-semibold md:col-span-1">Tickets</div>
	<div class="md:col-span-3">
    <a href="https://forms.gle/utruZzCRLENuh1xr5" target="_blank">
      <span
        class="text-xl inline-block rounded bg-orange-300 px-6 py-2 text-white font-semibold"
      >
        Tickets
      </span>
    </a>
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	{#if screening.description && screening.description.length > 0}
		<div class="font-semibold md:col-span-1">About</div>
		<div class="md:col-span-3">
			<RichText blocks={screening.description} class="space-y-3 leading-relaxed text-gallery-700" />
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}


	{#if screening.films && screening.films.length > 0}
		<div class="font-semibold md:col-span-1">Films</div>
		<div class="md:col-span-5">
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each screening.films as film}
					<a href="/programme/{slugify(film.englishTitle)}" class="group block">
						<div class="aspect-video w-full overflow-hidden bg-gallery-200">
							{#if getFilmImageUrl(film)}
								<img
									src={getFilmImageUrl(film)}
									alt={film.englishTitle}
									class="h-full w-full object-cover"
								/>
							{/if}
						</div>
						<div class="pt-3">
							<h2
								class="text-base font-semibold text-gallery-800 group-hover:text-accent-500"
							>
								{film.englishTitle}
							</h2>
							<p class="mt-1 text-sm text-gallery-500">
								{film.directorName}
							</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</GridLayout>

<style>
	a {
		text-decoration: none;
	}
</style>
