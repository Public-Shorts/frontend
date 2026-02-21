<script lang="ts">
	import { browser } from '$app/environment';
	import { buildMiniGraphData, type MiniGraphInput, type GraphNode } from './graphUtils';
	import GraphTooltip from './GraphTooltip.svelte';

	interface Props {
		currentFilmId: string;
		currentFilmTitle: string;
		currentFilmSlug: string;
		metaCategories: MiniGraphInput['metaCategories'];
		clusters: MiniGraphInput['clusters'];
		neighborFilms: MiniGraphInput['neighborFilms'];
	}

	let {
		currentFilmId,
		currentFilmTitle,
		currentFilmSlug,
		metaCategories,
		clusters,
		neighborFilms,
	}: Props = $props();

	let hoveredNode = $state<GraphNode | null>(null);
	let mousePos = $state({ x: 0, y: 0 });

	const graphData = $derived(
		buildMiniGraphData({
			currentFilmId,
			currentFilmTitle,
			currentFilmSlug,
			metaCategories,
			clusters,
			neighborFilms,
		})
	);

	const hasConnections = $derived(metaCategories.length > 0 || clusters.length > 0);
</script>

{#if hasConnections}
	<div class="font-semibold md:col-span-1">Connections</div>
	<div class="md:col-span-5">
		<div class="w-full overflow-hidden" style="height: 350px;">
			{#if browser}
				{#await import('./MiniGraphView.svelte') then { default: MiniGraphView }}
					<MiniGraphView
						{graphData}
						{currentFilmId}
						onNodeHover={(node, pos) => {
							hoveredNode = node;
							mousePos = pos;
						}}
					/>
				{/await}
			{:else}
				<div class="flex items-center justify-center text-xs text-gallery-400" style="height: 350px;">
					Loading graph...
				</div>
			{/if}
		</div>
		<GraphTooltip node={hoveredNode} x={mousePos.x} y={mousePos.y} />
		<div class="mt-3 flex items-center justify-between text-[11px] text-gallery-400">
			<div class="flex items-center gap-4">
				<span class="flex items-center gap-1.5">
					<span
						class="inline-block h-2 w-2 rounded-full"
						style="background: #857f7a"
					></span>
					Film
				</span>
				<span class="flex items-center gap-1.5">
					<span
						class="inline-block h-2 w-2 rounded-sm"
						style="background: #ff7411"
					></span>
					Category
				</span>
				<span class="flex items-center gap-1.5">
					<span
						class="inline-block h-2 w-2 rotate-45 rounded-sm"
						style="background: #8b5cf6"
					></span>
					Cluster
				</span>
			</div>
			<a
				href="/programme/map"
				class="text-gallery-500 underline underline-offset-2 hover:text-gallery-700"
			>
				View full map
			</a>
		</div>
	</div>
{/if}
