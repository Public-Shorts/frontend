<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GraphControls from './GraphControls.svelte';

	const { Story } = defineMeta({
		title: 'Visualiser/GraphControls',
		component: GraphControls,
	});
</script>

<script lang="ts">
	import type { GraphToggles, DisplayOptions } from './graphUtils';

	const metaCategoryItems = [
		{ id: 'mc-1', label: 'Documentary', count: 8 },
		{ id: 'mc-2', label: 'Experimental', count: 5 },
		{ id: 'mc-3', label: 'Narrative', count: 12 },
	];

	const clusterItems = [
		{ id: 'cl-1', label: 'Urban Landscapes', count: 4 },
		{ id: 'cl-2', label: 'Memory & Identity', count: 6 },
	];

	let toggles = $state<GraphToggles>({
		metaCategories: { 'mc-1': true, 'mc-2': true, 'mc-3': true },
		clusters: { 'cl-1': true, 'cl-2': true },
	});

	let displayOptions = $state<DisplayOptions>({
		sizeMode: 'connections',
		labelMode: 'hover',
		forceStrength: 10,
		filterMode: 'union',
		showMetaCategories: true,
		showClusters: true,
	});

	let searchQuery = $state('');
</script>

<Story name="Default">
	{#snippet template()}
		<div class="flex" style="height: 600px;">
			<GraphControls
				{toggles}
				{displayOptions}
				{searchQuery}
				onToggleChange={(t) => (toggles = t)}
				onDisplayChange={(o) => (displayOptions = o)}
				onSearchChange={(q) => (searchQuery = q)}
				onZoomToFit={() => {}}
				{metaCategoryItems}
				{clusterItems}
			/>
			<div class="flex-1 bg-gallery-100 p-4">
				<p class="text-xs text-gallery-400">Graph area</p>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Filtered">
	{#snippet template()}
		<div class="flex" style="height: 600px;">
			<GraphControls
				toggles={{
					metaCategories: { 'mc-1': true, 'mc-2': false, 'mc-3': false },
					clusters: { 'cl-1': false, 'cl-2': false },
				}}
				displayOptions={{
					sizeMode: 'fixed',
					labelMode: 'always',
					forceStrength: 5,
					filterMode: 'intersection',
					showMetaCategories: true,
					showClusters: false,
				}}
				searchQuery="doc"
				onToggleChange={() => {}}
				onDisplayChange={() => {}}
				onSearchChange={() => {}}
				onZoomToFit={() => {}}
				{metaCategoryItems}
				{clusterItems}
			/>
			<div class="flex-1 bg-gallery-100 p-4">
				<p class="text-xs text-gallery-400">Graph area</p>
			</div>
		</div>
	{/snippet}
</Story>
