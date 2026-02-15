<script lang="ts">
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor } from '$lib/sanity';

	let { data } = $props();

	const totalCount = data.highlights.length + data.films.length;

	function getImageUrl(
		film: (typeof data.films)[0],
		width = 400,
		height = 300
	): string | null {
		const source = film.poster ?? film.screenshot;
		if (!source) return null;
		return urlFor(source).width(width).height(height).fit('crop').url();
	}
</script>

<SEO
	title="Programme"
	description="The official selection of Public Shorts, the 24/7 Video Festival in Berlin."
/>

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Programme</h1>

	{#if totalCount > 0}
		{#if data.highlights.length > 0}
			<div class="font-semibold md:col-span-1">Highlights</div>
			<div class="md:col-span-5">
				<p class="mb-6 text-gallery-600">Curator picks for the 2026 edition.</p>
				<div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
					{#each data.highlights as film}
						<a href="/programme/{film.slug}" class="group block">
							<div
								class="relative aspect-video w-full overflow-hidden border-l-4 border-accent-500 bg-gallery-200"
							>
								{#if getImageUrl(film, 600, 338)}
									<img
										src={getImageUrl(film, 600, 338)}
										alt={film.englishTitle}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
									/>
								{/if}
							</div>
							<div class="pt-3">
								<h2
									class="text-lg font-semibold text-gallery-800 group-hover:text-accent-500"
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
		{/if}

		{#if data.films.length > 0}
			<div class="font-semibold md:col-span-1">Selection</div>
			<div class="md:col-span-5">
				<p class="mb-6 text-gallery-600">
					{totalCount} films selected for the 2026 edition.
				</p>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.films as film}
						<a href="/programme/{film.slug}" class="group block">
							<div class="aspect-4/3 w-full overflow-hidden bg-gallery-200">
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
		{/if}
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
