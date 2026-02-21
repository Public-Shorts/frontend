<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GraphTooltip from './GraphTooltip.svelte';

	const { Story } = defineMeta({
		title: 'Visualiser/GraphTooltip',
		component: GraphTooltip,
	});
</script>

<script lang="ts">
	import { fetchSanity } from '$lib/sanity/client';
	import type { GraphNode } from './graphUtils';

	let sanityFilmNode = $state<GraphNode | null>(null);
	let sanityMcNode = $state<GraphNode | null>(null);
	let sanityClNode = $state<GraphNode | null>(null);
	let sanityLoaded = $state(false);

	async function loadSanityData() {
		const [films, mcs, cls] = await Promise.all([
			fetchSanity<Array<{ _id: string; englishTitle: string; directorName: string; length: number }>>(
				`*[_type == "submission"][0..9]{ _id, englishTitle, directorName, length }`
			),
			fetchSanity<Array<{ _id: string; name: string; filmCount: number }>>(
				`*[_type == "metaCategory"][0..4]{ _id, name, "filmCount": count(films) }`
			),
			fetchSanity<Array<{ _id: string; name: string; filmCount: number }>>(
				`*[_type == "semanticCluster"][0..4]{ _id, name, "filmCount": count(highlightedFilms) + count(relevantFilms) }`
			),
		]);

		const film = films?.[0];
		if (film) {
			sanityFilmNode = {
				id: film._id,
				type: 'film',
				label: film.englishTitle,
				val: 3,
				color: '#857f7a',
				active: true,
				visible: true,
				data: { englishTitle: film.englishTitle, directorName: film.directorName, length: film.length },
			};
		}

		const mc = mcs?.[0];
		if (mc) {
			sanityMcNode = {
				id: `mc-${mc._id}`,
				type: 'meta-category',
				label: mc.name,
				val: 4,
				color: '#ff7411',
				active: true,
				visible: true,
				data: { name: mc.name, filmCount: mc.filmCount },
			};
		}

		const cl = cls?.[0];
		if (cl) {
			sanityClNode = {
				id: `cl-${cl._id}`,
				type: 'cluster',
				label: cl.name,
				val: 4,
				color: '#8b5cf6',
				active: true,
				visible: true,
				data: { name: cl.name, filmCount: cl.filmCount },
			};
		}

		sanityLoaded = true;
	}

	loadSanityData();
</script>

<Story name="Film">
	{#snippet template()}
		<div class="relative h-64 w-full">
			<GraphTooltip
				node={{
					id: 'film-1',
					type: 'film',
					label: 'Dawn Chorus',
					val: 3,
					color: '#857f7a',
					active: true,
					visible: true,
					data: {
						englishTitle: 'Dawn Chorus',
						directorName: 'Alice Martin',
						length: 12,
					},
				}}
				x={120}
				y={80}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Meta-category">
	{#snippet template()}
		<div class="relative h-64 w-full">
			<GraphTooltip
				node={{
					id: 'mc-1',
					type: 'meta-category',
					label: 'Documentary',
					val: 4,
					color: '#ff7411',
					active: true,
					visible: true,
					data: { name: 'Documentary', filmCount: 8 },
				}}
				x={120}
				y={80}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Cluster">
	{#snippet template()}
		<div class="relative h-64 w-full">
			<GraphTooltip
				node={{
					id: 'cl-1',
					type: 'cluster',
					label: 'Urban Landscapes',
					val: 4,
					color: '#8b5cf6',
					active: true,
					visible: true,
					data: { name: 'Urban Landscapes', filmCount: 5 },
				}}
				x={120}
				y={80}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Film (Sanity)">
	{#snippet template()}
		<div class="relative h-64 w-full">
			{#if !sanityLoaded}
				<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>
			{:else if sanityFilmNode}
				<GraphTooltip node={sanityFilmNode} x={120} y={80} />
			{:else}
				<p class="p-4 text-sm text-red-500">No film data found</p>
			{/if}
		</div>
	{/snippet}
</Story>

<Story name="Meta-category (Sanity)">
	{#snippet template()}
		<div class="relative h-64 w-full">
			{#if !sanityLoaded}
				<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>
			{:else if sanityMcNode}
				<GraphTooltip node={sanityMcNode} x={120} y={80} />
			{:else}
				<p class="p-4 text-sm text-red-500">No category data found</p>
			{/if}
		</div>
	{/snippet}
</Story>

<Story name="Cluster (Sanity)">
	{#snippet template()}
		<div class="relative h-64 w-full">
			{#if !sanityLoaded}
				<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>
			{:else if sanityClNode}
				<GraphTooltip node={sanityClNode} x={120} y={80} />
			{:else}
				<p class="p-4 text-sm text-red-500">No cluster data found</p>
			{/if}
		</div>
	{/snippet}
</Story>
