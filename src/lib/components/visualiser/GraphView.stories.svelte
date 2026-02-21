<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GraphView from './GraphView.svelte';

	const { Story } = defineMeta({
		title: 'Visualiser/GraphView',
		component: GraphView,
	});
</script>

<script lang="ts">
	import type { GraphData, GraphNode, DisplayOptions } from './graphUtils';
	import GraphTooltip from './GraphTooltip.svelte';
	import { fetchSanity } from '$lib/sanity/client';

	let hoveredNode = $state<GraphNode | null>(null);
	let mousePos = $state({ x: 0, y: 0 });

	const mockDisplayOptions: DisplayOptions = {
		sizeMode: 'connections',
		labelMode: 'hover',
		forceStrength: 10,
		filterMode: 'union',
		showMetaCategories: true,
		showClusters: true,
	};

	const mockGraphData: GraphData = {
		nodes: [
			{ id: 'f1', type: 'film', label: 'Dawn Chorus', val: 3, color: '#857f7a', active: true, visible: true, data: { englishTitle: 'Dawn Chorus', directorName: 'Alice Martin', length: 12, slug: 'dawn-chorus' } },
			{ id: 'f2', type: 'film', label: 'Concrete Lullaby', val: 2, color: '#857f7a', active: true, visible: true, data: { englishTitle: 'Concrete Lullaby', directorName: 'Bob Chen', length: 8, slug: 'concrete-lullaby' } },
			{ id: 'f3', type: 'film', label: 'After the Rain', val: 2, color: '#857f7a', active: true, visible: true, data: { englishTitle: 'After the Rain', directorName: 'Clara Dias', length: 15, slug: 'after-the-rain' } },
			{ id: 'f4', type: 'film', label: 'Quiet Machines', val: 1.5, color: '#857f7a', active: true, visible: true, data: { englishTitle: 'Quiet Machines', directorName: 'Dan Erickson', length: 6, slug: 'quiet-machines' } },
			{ id: 'f5', type: 'film', label: 'Still Life', val: 1.5, color: '#857f7a', active: false, visible: true, data: { englishTitle: 'Still Life', directorName: 'Eva Fernandez', length: 10, slug: 'still-life' } },
			{ id: 'mc-1', type: 'meta-category', label: 'Documentary', val: 6, color: '#ff7411', active: true, visible: true, data: { name: 'Documentary', filmCount: 3 } },
			{ id: 'mc-2', type: 'meta-category', label: 'Experimental', val: 4, color: '#ff7411', active: true, visible: true, data: { name: 'Experimental', filmCount: 2 } },
			{ id: 'cl-1', type: 'cluster', label: 'Urban Landscapes', val: 5, color: '#8b5cf6', active: true, visible: true, data: { name: 'Urban Landscapes', filmCount: 3 } },
		],
		links: [
			{ source: 'f1', target: 'mc-1', type: 'film-meta' },
			{ source: 'f2', target: 'mc-1', type: 'film-meta' },
			{ source: 'f3', target: 'mc-1', type: 'film-meta' },
			{ source: 'f1', target: 'mc-2', type: 'film-meta' },
			{ source: 'f4', target: 'mc-2', type: 'film-meta' },
			{ source: 'f2', target: 'cl-1', type: 'film-cluster' },
			{ source: 'f3', target: 'cl-1', type: 'film-cluster' },
			{ source: 'f5', target: 'cl-1', type: 'film-cluster' },
		],
		activeFilmIds: new Set(['f1', 'f2', 'f3', 'f4']),
	};

	// Sanity data
	let sanityGraphData = $state<GraphData | null>(null);
	let sanityLoaded = $state(false);

	async function loadSanityData() {
		const [films, mcs, cls] = await Promise.all([
			fetchSanity<Array<{ _id: string; englishTitle: string; directorName: string; length: number }>>(
				`*[_type == "tvSelection"][0].films[].film->{ _id, englishTitle, directorName, length }[0..19]`
			),
			fetchSanity<Array<{ _id: string; name: string; filmIds: string[] }>>(
				`*[_type == "metaCategory"]{ _id, name, "filmIds": films[].film._ref }`
			),
			fetchSanity<Array<{ _id: string; name: string; filmIds: string[] }>>(
				`*[_type == "semanticCluster"]{ _id, name, "filmIds": [...highlightedFilms[]._ref, ...relevantFilms[]._ref] }`
			),
		]);

		if (!films?.length) { sanityLoaded = true; return; }

		const filmIdSet = new Set(films.map((f) => f._id));
		const nodes: GraphNode[] = [];
		const links: GraphData['links'] = [];

		for (const film of films) {
			nodes.push({
				id: film._id, type: 'film', label: film.englishTitle, val: 2,
				color: '#857f7a', active: true, visible: true,
				data: { englishTitle: film.englishTitle, directorName: film.directorName, length: film.length },
			});
		}

		for (const mc of mcs ?? []) {
			const valid = (mc.filmIds ?? []).filter((id) => filmIdSet.has(id));
			if (valid.length === 0) continue;
			nodes.push({
				id: `mc-${mc._id}`, type: 'meta-category', label: mc.name, val: 6,
				color: '#ff7411', active: true, visible: true,
				data: { name: mc.name, filmCount: valid.length },
			});
			for (const fid of valid) links.push({ source: fid, target: `mc-${mc._id}`, type: 'film-meta' });
		}

		for (const cl of cls ?? []) {
			const valid = [...new Set((cl.filmIds ?? []).filter((id) => filmIdSet.has(id)))];
			if (valid.length === 0) continue;
			nodes.push({
				id: `cl-${cl._id}`, type: 'cluster', label: cl.name, val: 5,
				color: '#8b5cf6', active: true, visible: true,
				data: { name: cl.name, filmCount: valid.length },
			});
			for (const fid of valid) links.push({ source: fid, target: `cl-${cl._id}`, type: 'film-cluster' });
		}

		sanityGraphData = { nodes, links, activeFilmIds: filmIdSet };
		sanityLoaded = true;
	}

	loadSanityData();
</script>

<Story name="Default">
	{#snippet template()}
		<div class="relative" style="height: 500px;">
			<GraphView
				graphData={mockGraphData}
				displayOptions={mockDisplayOptions}
				onNodeHover={(node, pos) => { hoveredNode = node; mousePos = pos; }}
				onNodeClick={() => {}}
			/>
			<GraphTooltip node={hoveredNode} x={mousePos.x} y={mousePos.y} />
		</div>
	{/snippet}
</Story>

<Story name="Sanity Data">
	{#snippet template()}
		<div class="relative" style="height: 500px;">
			{#if !sanityLoaded}
				<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>
			{:else if sanityGraphData}
				<GraphView
					graphData={sanityGraphData}
					displayOptions={mockDisplayOptions}
					onNodeHover={(node, pos) => { hoveredNode = node; mousePos = pos; }}
					onNodeClick={() => {}}
				/>
				<GraphTooltip node={hoveredNode} x={mousePos.x} y={mousePos.y} />
			{:else}
				<p class="p-4 text-sm text-red-500">No data found</p>
			{/if}
		</div>
	{/snippet}
</Story>
