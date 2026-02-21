<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MiniGraphView from './MiniGraphView.svelte';

	const { Story } = defineMeta({
		title: 'Visualiser/MiniGraphView',
		component: MiniGraphView,
	});
</script>

<script lang="ts">
	import { buildMiniGraphData, type GraphNode } from './graphUtils';
	import GraphTooltip from './GraphTooltip.svelte';
	import { fetchSanity } from '$lib/sanity/client';

	let hoveredNode = $state<GraphNode | null>(null);
	let mousePos = $state({ x: 0, y: 0 });

	const mockGraphData = buildMiniGraphData({
		currentFilmId: 'f1',
		currentFilmTitle: 'Dawn Chorus',
		currentFilmSlug: 'dawn-chorus',
		metaCategories: [
			{ _id: 'mc-1', name: 'Documentary', filmIds: ['f1', 'f2', 'f3'] },
			{ _id: 'mc-2', name: 'Experimental', filmIds: ['f1', 'f4'] },
		],
		clusters: [
			{ _id: 'cl-1', name: 'Urban Landscapes', filmIds: ['f1', 'f2'] },
		],
		neighborFilms: [
			{ _id: 'f2', englishTitle: 'Concrete Lullaby', length: 8, slug: 'concrete-lullaby' },
			{ _id: 'f3', englishTitle: 'After the Rain', length: 15, slug: 'after-the-rain' },
			{ _id: 'f4', englishTitle: 'Quiet Machines', length: 6, slug: 'quiet-machines' },
		],
	});

	// Sanity data
	let sanityGraphData = $state<ReturnType<typeof buildMiniGraphData> | null>(null);
	let sanityFilmId = $state<string | null>(null);
	let sanityLoaded = $state(false);

	async function loadSanityData() {
		const films = await fetchSanity<Array<{ _id: string; englishTitle: string }>>(
			`*[_type == "tvSelection"][0].films[0..0].film->{ _id, englishTitle }`
		);
		const film = films?.[0];
		if (!film) { sanityLoaded = true; return; }

		sanityFilmId = film._id;

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

		const neighborFilms = (neighbors ?? []).map((n) => ({ ...n, slug: n._id }));

		sanityGraphData = buildMiniGraphData({
			currentFilmId: film._id,
			currentFilmTitle: film.englishTitle,
			currentFilmSlug: film._id,
			metaCategories: mcs ?? [],
			clusters: cls ?? [],
			neighborFilms,
		});
		sanityLoaded = true;
	}

	loadSanityData();
</script>

<Story name="Default">
	{#snippet template()}
		<div class="relative" style="height: 350px;">
			<MiniGraphView
				graphData={mockGraphData}
				currentFilmId="f1"
				onNodeHover={(node, pos) => { hoveredNode = node; mousePos = pos; }}
			/>
			<GraphTooltip node={hoveredNode} x={mousePos.x} y={mousePos.y} />
		</div>
	{/snippet}
</Story>

<Story name="Sanity Data">
	{#snippet template()}
		<div class="relative" style="height: 350px;">
			{#if !sanityLoaded}
				<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>
			{:else if sanityGraphData && sanityFilmId}
				<MiniGraphView
					graphData={sanityGraphData}
					currentFilmId={sanityFilmId}
					onNodeHover={(node, pos) => { hoveredNode = node; mousePos = pos; }}
				/>
				<GraphTooltip node={hoveredNode} x={mousePos.x} y={mousePos.y} />
			{:else}
				<p class="p-4 text-sm text-red-500">No data found</p>
			{/if}
		</div>
	{/snippet}
</Story>
