<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MiniGraphSection from './MiniGraphSection.svelte';

	const { Story } = defineMeta({
		title: 'Visualiser/MiniGraphSection',
		component: MiniGraphSection,
	});
</script>

<script lang="ts">
	import { fetchSanity } from '$lib/sanity/client';

	// Sanity data
	let sanityProps = $state<{
		currentFilmId: string;
		currentFilmTitle: string;
		currentFilmSlug: string;
		metaCategories: Array<{ _id: string; name: string; filmIds: string[] }>;
		clusters: Array<{ _id: string; name: string; filmIds: string[] }>;
		screenings: Array<{ _id: string; name: string; filmIds: string[] }>;
		neighborFilms: Array<{ _id: string; englishTitle: string; length: number; slug: string }>;
	} | null>(null);
	let sanityLoaded = $state(false);

	async function loadSanityData() {
		const films = await fetchSanity<Array<{ _id: string; englishTitle: string }>>(
			`*[_type == "tvSelection"][0].films[0..0].film->{ _id, englishTitle }`
		);
		const film = films?.[0];
		if (!film) { sanityLoaded = true; return; }

		const [mcs, cls, neighbors] = await Promise.all([
			fetchSanity<Array<{ _id: string; name: string; filmIds: string[] }>>(
				`*[_type == "metaCategory" && $id in films[].film._ref]{ _id, name, "filmIds": films[].film._ref }`,
				{ id: film._id }
			),
			fetchSanity<Array<{ _id: string; name: string; filmIds: string[] }>>(
				`*[_type == "semanticCluster" && ($id in highlightedFilms[]._ref || $id in relevantFilms[]._ref)]{ _id, name, "filmIds": [...highlightedFilms[]._ref, ...relevantFilms[]._ref] }`,
				{ id: film._id }
			),
			fetchSanity<Array<{ _id: string; englishTitle: string; length: number }>>(
				`*[_type == "tvSelection"][0].films[1..5].film->{ _id, englishTitle, length }`
			),
		]);

		sanityProps = {
			currentFilmId: film._id,
			currentFilmTitle: film.englishTitle,
			currentFilmSlug: film._id,
			metaCategories: mcs ?? [],
			clusters: cls ?? [],
			screenings: [],
			neighborFilms: (neighbors ?? []).map((n) => ({ ...n, slug: n._id })),
		};
		sanityLoaded = true;
	}

	loadSanityData();
</script>

<Story name="Default">
	{#snippet template()}
		<div class="grid grid-cols-6 gap-x-6 gap-y-4">
			<MiniGraphSection
				currentFilmId="f1"
				currentFilmTitle="Dawn Chorus"
				currentFilmSlug="dawn-chorus"
				metaCategories={[
					{ _id: 'mc-1', name: 'Documentary', filmIds: ['f1', 'f2', 'f3'] },
					{ _id: 'mc-2', name: 'Experimental', filmIds: ['f1', 'f4'] },
				]}
				clusters={[
					{ _id: 'cl-1', name: 'Urban Landscapes', filmIds: ['f1', 'f2'] },
				]}
				screenings={[
					{ _id: 'sc-1', name: 'Screening 1', filmIds: ['f1', 'f2', 'f3'] },
				]}
				neighborFilms={[
					{ _id: 'f2', englishTitle: 'Concrete Lullaby', length: 8, slug: 'concrete-lullaby' },
					{ _id: 'f3', englishTitle: 'After the Rain', length: 15, slug: 'after-the-rain' },
					{ _id: 'f4', englishTitle: 'Quiet Machines', length: 6, slug: 'quiet-machines' },
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="No Connections">
	{#snippet template()}
		<div class="grid grid-cols-6 gap-x-6 gap-y-4">
			<MiniGraphSection
				currentFilmId="f1"
				currentFilmTitle="Isolated Film"
				currentFilmSlug="isolated-film"
				metaCategories={[]}
				clusters={[]}
				screenings={[]}
				neighborFilms={[]}
			/>
			<p class="col-span-6 text-sm text-gallery-400">
				(Component renders nothing when there are no connections)
			</p>
		</div>
	{/snippet}
</Story>

<Story name="Sanity Data">
	{#snippet template()}
		<div class="grid grid-cols-6 gap-x-6 gap-y-4">
			{#if !sanityLoaded}
				<p class="col-span-6 p-4 text-sm text-gallery-400">Loading from Sanity...</p>
			{:else if sanityProps}
				<MiniGraphSection {...sanityProps} />
			{:else}
				<p class="col-span-6 p-4 text-sm text-red-500">No data found</p>
			{/if}
		</div>
	{/snippet}
</Story>
