<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { ChevronLeft, ChevronRight, Download } from 'lucide-svelte';
	import SEO from '$lib/components/SEO.svelte';
	import GraphView from '$lib/components/visualiser/GraphView.svelte';
	import GraphControls from '$lib/components/visualiser/GraphControls.svelte';
	import GraphTooltip from '$lib/components/visualiser/GraphTooltip.svelte';
	import {
		buildGraphData,
		formatDuration,
		type GraphToggles,
		type DisplayOptions,
		type GraphNode,
		type FilmNodeData,
	} from '$lib/components/visualiser/graphUtils';

	let { data } = $props();

	let metaCategoryItems = $derived(
		data.metaCategories
			.filter((mc: any) => mc.filmIds.length > 0)
			.map((mc: any) => ({
				id: mc._id,
				label: mc.name,
				count: mc.filmIds.length,
			}))
	);

	let clusterItems = $derived(
		data.clusters
			.filter(
				(c: any) => c.highlightedFilmIds.length + c.relevantFilmIds.length > 0
			)
			.map((c: any) => ({
				id: c._id,
				label: c.name,
				count: c.highlightedFilmIds.length + c.relevantFilmIds.length,
			}))
	);

	let screeningItems = $derived(
		data.screenings
			.filter((s: any) => s.filmIds.length > 0)
			.map((s: any) => ({
				id: s._id,
				label: s.name,
				count: s.filmIds.length,
			}))
	);

	const activeMcs = data.metaCategories.filter((mc: any) => mc.filmIds.length > 0);
	const activeCls = data.clusters.filter(
		(c: any) => c.highlightedFilmIds.length + c.relevantFilmIds.length > 0
	);
	const activeScs = data.screenings.filter((s: any) => s.filmIds.length > 0);

	function buildInitialToggles() {
		const filter = data.filter;
		if (filter?.startsWith('mc-')) {
			const mcId = filter.slice(3);
			return {
				toggles: {
					metaCategories: Object.fromEntries(
						activeMcs.map((mc: any) => [mc._id, mc._id === mcId])
					),
					clusters: Object.fromEntries(
						activeCls.map((c: any) => [c._id, false])
					),
					screenings: Object.fromEntries(
						activeScs.map((s: any) => [s._id, false])
					),
				},
				showMetaCategories: true,
				showClusters: false,
				showScreenings: false,
			};
		}
		if (filter?.startsWith('cl-')) {
			const clId = filter.slice(3);
			return {
				toggles: {
					metaCategories: Object.fromEntries(
						activeMcs.map((mc: any) => [mc._id, false])
					),
					clusters: Object.fromEntries(
						activeCls.map((c: any) => [c._id, c._id === clId])
					),
					screenings: Object.fromEntries(
						activeScs.map((s: any) => [s._id, false])
					),
				},
				showMetaCategories: false,
				showClusters: true,
				showScreenings: false,
			};
		}
		if (filter?.startsWith('sc-')) {
			const scId = filter.slice(3);
			return {
				toggles: {
					metaCategories: Object.fromEntries(
						activeMcs.map((mc: any) => [mc._id, false])
					),
					clusters: Object.fromEntries(
						activeCls.map((c: any) => [c._id, false])
					),
					screenings: Object.fromEntries(
						activeScs.map((s: any) => [s._id, s._id === scId])
					),
				},
				showMetaCategories: false,
				showClusters: false,
				showScreenings: true,
			};
		}
		return {
			toggles: {
				metaCategories: Object.fromEntries(
					activeMcs.map((mc: any) => [mc._id, true])
				),
				clusters: Object.fromEntries(activeCls.map((c: any) => [c._id, true])),
				screenings: Object.fromEntries(activeScs.map((s: any) => [s._id, true])),
			},
			showMetaCategories: true,
			showClusters: true,
			showScreenings: true,
		};
	}

	const initial = buildInitialToggles();

	let toggles = $state<GraphToggles>(initial.toggles);

	let displayOptions = $state<DisplayOptions>({
		sizeMode: 'connections',
		labelMode: 'hover',
		forceStrength: 10,
		filterMode: 'union',
		showMetaCategories: initial.showMetaCategories,
		showClusters: initial.showClusters,
		showScreenings: initial.showScreenings,
	});

	let searchQuery = $state('');
	let hoveredNode = $state<GraphNode | null>(null);
	let mousePos = $state({ x: 0, y: 0 });
	let graphViewRef: GraphView;
	let rightCollapsed = $state(false);

	let graphData = $derived.by(() => {
		return buildGraphData(
			data.films,
			data.metaCategories,
			data.clusters,
			data.screenings,
			toggles,
			displayOptions
		);
	});

	let activeFilms = $derived.by(() => {
		return data.films
			.filter((f: FilmNodeData) => graphData.activeFilmIds.has(f._id))
			.sort((a: FilmNodeData, b: FilmNodeData) =>
				a.englishTitle.localeCompare(b.englishTitle)
			);
	});

	let activeScreenTime = $derived(
		activeFilms.reduce((sum: number, f: FilmNodeData) => sum + (f.length || 0), 0)
	);

	let displayedGraphData = $derived.by(() => {
		if (!searchQuery.trim()) return graphData;
		const q = searchQuery.toLowerCase();
		return {
			nodes: graphData.nodes.map((n) => ({
				...n,
				active: n.active && n.label.toLowerCase().includes(q),
			})),
			links: graphData.links,
			activeFilmIds: graphData.activeFilmIds,
		};
	});

	function downloadImage() {
		const dataUrl = graphViewRef?.exportImage();
		if (!dataUrl) return;
		const a = document.createElement('a');
		a.href = dataUrl;
		a.download = 'programme-map.png';
		a.click();
	}

	function handleNodeClick(node: GraphNode) {
		if (node.type === 'film') {
			goto(`/programme/${node.data.slug}`);
		} else if (node.type === 'meta-category') {
			const id = node.id.replace('mc-', '');
			const allOn = metaCategoryItems.every(
				(i: any) => toggles.metaCategories[i.id]
			);
			if (allOn) {
				const solo: Record<string, boolean> = {};
				for (const i of metaCategoryItems) solo[i.id] = i.id === id;
				toggles = { ...toggles, metaCategories: solo };
			} else {
				toggles = {
					...toggles,
					metaCategories: {
						...toggles.metaCategories,
						[id]: !toggles.metaCategories[id],
					},
				};
			}
		} else if (node.type === 'cluster') {
			const id = node.id.replace('cl-', '');
			const allOn = clusterItems.every((i: any) => toggles.clusters[i.id]);
			if (allOn) {
				const solo: Record<string, boolean> = {};
				for (const i of clusterItems) solo[i.id] = i.id === id;
				toggles = { ...toggles, clusters: solo };
			} else {
				toggles = {
					...toggles,
					clusters: { ...toggles.clusters, [id]: !toggles.clusters[id] },
				};
			}
		} else if (node.type === 'screening') {
			const id = node.id.replace('sc-', '');
			const allOn = screeningItems.every((i: any) => toggles.screenings[i.id]);
			if (allOn) {
				const solo: Record<string, boolean> = {};
				for (const i of screeningItems) solo[i.id] = i.id === id;
				toggles = { ...toggles, screenings: solo };
			} else {
				toggles = {
					...toggles,
					screenings: { ...toggles.screenings, [id]: !toggles.screenings[id] },
				};
			}
		}
	}
</script>

<SEO
	title="Programme Map"
	description="Explore the Public Shorts film selection as an interactive graph."
/>

<div class="flex bg-gallery-50" style="height: calc(100dvh - 57px);">
	<GraphControls
		{toggles}
		{displayOptions}
		{searchQuery}
		onToggleChange={(t) => (toggles = t)}
		onDisplayChange={(o) => (displayOptions = o)}
		onSearchChange={(q) => (searchQuery = q)}
		onZoomToFit={() => graphViewRef?.zoomToFit()}
		{metaCategoryItems}
		{clusterItems}
		{screeningItems}
	/>

	<div class="relative min-w-0 flex-1">
		<GraphView
			bind:this={graphViewRef}
			graphData={displayedGraphData}
			{displayOptions}
			onNodeHover={(node, pos) => {
				hoveredNode = node;
				mousePos = pos;
			}}
			onNodeClick={handleNodeClick}
		/>
		<GraphTooltip node={hoveredNode} x={mousePos.x} y={mousePos.y} />
		{#if dev}
			<button
				onclick={downloadImage}
				class="absolute bottom-4 right-4 rounded-md border border-gallery-200 bg-gallery-50 p-2 text-gallery-500 shadow-sm transition-colors hover:text-gallery-800"
				title="Download as PNG"
			>
				<Download class="h-4 w-4" />
			</button>
		{/if}
	</div>

	<!-- Right panel: Active Films -->
	<aside
		class="
			shrink-0 overflow-y-auto border-l border-gallery-200 bg-gallery-50 text-gallery-700
			transition-all duration-200
			{rightCollapsed ? 'w-10' : 'w-72'}
			hidden md:block
		"
	>
		{#if !rightCollapsed}
			<div class="flex flex-col gap-3 p-4">
				<div class="flex items-center justify-between">
					<h2
						class="text-xs font-bold uppercase tracking-wider text-gallery-500"
					>
						Films
					</h2>
					<button
						class="text-gallery-400 hover:text-gallery-700"
						onclick={() => (rightCollapsed = true)}
					>
						<ChevronRight class="h-4 w-4" />
					</button>
				</div>

				<div class="flex items-baseline gap-3">
					<span class="text-2xl font-bold text-gallery-800"
						>{activeFilms.length}</span
					>
					<span class="text-[11px] text-gallery-500">
						films / {formatDuration(activeScreenTime)}
					</span>
				</div>
				{#if activeFilms.length < data.films.length}
					<p class="text-[10px] text-gallery-400">
						{data.films.length - activeFilms.length} inactive
					</p>
				{/if}

				{#if activeFilms.length > 0}
					<div
						class="flex flex-col gap-0.5 overflow-y-auto"
						style="max-height: calc(100dvh - 200px);"
					>
						{#each activeFilms as film}
							<a
								href="/programme/{film.slug}"
								class="flex items-center justify-between rounded px-2 py-1.5 text-[11px] transition-colors hover:bg-gallery-100"
							>
								<span
									class="truncate text-gallery-700"
									title={film.englishTitle}
								>
									{film.englishTitle}
								</span>
								<span class="ml-2 shrink-0 text-gallery-400"
									>{film.length}m</span
								>
							</a>
						{/each}
					</div>
				{:else}
					<p class="text-xs text-gallery-400">
						No films match the current filters.
					</p>
				{/if}
			</div>
		{:else}
			<div class="flex h-full flex-col items-center pt-3">
				<button
					class="text-gallery-400 hover:text-gallery-700"
					onclick={() => (rightCollapsed = false)}
				>
					<ChevronLeft class="h-4 w-4" />
				</button>
			</div>
		{/if}
	</aside>
</div>

<style>
	aside a {
		text-decoration: none;
	}
</style>
