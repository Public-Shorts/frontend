<script lang="ts">
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor } from '$lib/sanity';

	let { data } = $props();

	type SortKey = 'name' | 'year' | 'length';
	let sortBy = $state<SortKey>('name');
	let sortAsc = $state(true);

	function toggleSort(key: SortKey) {
		if (sortBy === key) {
			sortAsc = !sortAsc;
		} else {
			sortBy = key;
			sortAsc = true;
		}
	}

	const sortedFilms = $derived(
		[...data.films].sort((a, b) => {
			const dir = sortAsc ? 1 : -1;
			if (sortBy === 'year')
				return dir * ((a.yearOfCompletion ?? 0) - (b.yearOfCompletion ?? 0));
			if (sortBy === 'length') return dir * ((a.length ?? 0) - (b.length ?? 0));
			return dir * a.englishTitle.localeCompare(b.englishTitle);
		})
	);

	function getImageUrl(film: (typeof data.films)[0]): string | null {
		const source = film.poster ?? film.screenshot;
		if (!source) return null;
		return urlFor(source).width(600).height(338).fit('crop').url();
	}
</script>

<SEO
	title="Programme"
	description="The official selection of Public Shorts, the 24/7 Video Festival in Berlin."
/>

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Programme</h1>

	<div class="font-semibold md:col-span-1">Explore</div>
	<div class="md:col-span-3">
		Navigate the selection visually — films are arranged by thematic clusters and curator tags.
		<a
			href="/programme/map"
			class="mt-1 inline-block underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
		>
			Open the map
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

	{#if data.films.length > 0}
		<div class="font-semibold md:col-span-1">Selection</div>
		<div class="md:col-span-5">
			<div class="mb-6 flex items-baseline justify-between">
				<p class="text-gallery-600">
					{data.films.length} films selected for the 2026 edition.
				</p>
				<div class="flex gap-1 text-sm">
					{#each [['name', 'Name'], ['year', 'Year'], ['length', 'Length']] as [key, label]}
						<button
							onclick={() => toggleSort(key as SortKey)}
							class="rounded px-2 py-1 transition-colors {sortBy === key
								? 'bg-gallery-900 text-white'
								: 'text-gallery-500 hover:text-gallery-700'}"
						>
							{label}
							{#if sortBy === key}
								<span class="ml-0.5 text-xs">{sortAsc ? '↑' : '↓'}</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each sortedFilms as film (film._id)}
					<a href="/programme/{film.slug}" class="group block">
						<div class="aspect-video w-full overflow-hidden bg-gallery-200">
							{#if getImageUrl(film)}
								<img
									src={getImageUrl(film)}
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
							<p class="mt-1 text-sm text-gallery-400">
								{film.yearOfCompletion}{#if film.length}&ensp;·&ensp;{film.length} min{/if}
							</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{:else}
		<div class="md:col-span-3 md:col-start-2">
			<p>
				The programme is still in preparation and will be announced at the start of the festival.
				Check our <a href="/festival">festival page</a> for all information.
			</p>
		</div>
	{/if}
</GridLayout>

<style>
	a {
		text-decoration: none;
	}
</style>
