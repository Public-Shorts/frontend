<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { GraphNode } from './graphUtils';

	interface Props {
		node: GraphNode | null;
		x: number;
		y: number;
	}

	let { node, x, y }: Props = $props();

	let tooltipEl = $state<HTMLDivElement>();

	let position = $derived.by(() => {
		const offset = 16;
		const pad = 12;
		let left = x + offset;
		let top = y + offset;

		if (typeof window !== 'undefined' && tooltipEl) {
			const rect = tooltipEl.getBoundingClientRect();
			if (left + rect.width + pad > window.innerWidth) {
				left = x - rect.width - offset;
			}
			if (top + rect.height + pad > window.innerHeight) {
				top = y - rect.height - offset;
			}
		}

		return { left, top };
	});
</script>

{#if node}
	<div
		bind:this={tooltipEl}
		class="pointer-events-none fixed z-50 max-w-xs rounded-lg border border-gallery-200 bg-gallery-50 p-3 shadow-lg"
		style="left: {position.left}px; top: {position.top}px;"
		transition:fade={{ duration: 80 }}
	>
		{#if node.type === 'film'}
			{@const film = node.data as any}
			<p class="text-sm font-semibold text-gallery-800">{film.englishTitle}</p>
			{#if film.length}
				<p class="mt-1 text-[11px] text-gallery-500">{film.length} min</p>
			{/if}
			{#if film.synopsis}
				<p class="mt-1.5 text-xs text-gallery-600">
					{film.synopsis.length > 150
						? film.synopsis.slice(0, 150) + '...'
						: film.synopsis}
				</p>
			{/if}
			{#if film.categories?.length}
				<div class="mt-2 flex flex-wrap gap-1">
					{#each film.categories as cat}
						<span class="rounded bg-gallery-100 px-1.5 py-0.5 text-[10px] text-gallery-500">
							{cat}
						</span>
					{/each}
				</div>
			{/if}
		{:else if node.type === 'meta-category'}
			{@const mc = node.data as any}
			<div class="flex items-center gap-2">
				<span
					class="inline-block h-2.5 w-2.5 rounded-sm"
					style="background: #ff7411"
				></span>
				<p class="text-sm font-semibold text-gallery-800">{mc.name}</p>
				<span
					class="rounded bg-gallery-100 px-1.5 py-0.5 text-[10px] text-gallery-500"
				>
					{mc.type}
				</span>
			</div>
			{#if mc.description}
				<p class="mt-1 text-xs text-gallery-500">
					{mc.description.length > 120
						? mc.description.slice(0, 120) + '...'
						: mc.description}
				</p>
			{/if}
			<p class="mt-1.5 text-[11px] text-gallery-400">{mc.filmCount} films</p>
		{:else if node.type === 'cluster'}
			{@const cl = node.data as any}
			<div class="flex items-center gap-2">
				<span
					class="inline-block h-2.5 w-2.5 rotate-45 rounded-sm"
					style="background: #8b5cf6"
				></span>
				<p class="text-sm font-semibold text-gallery-800">{cl.name}</p>
			</div>
			{#if cl.description}
				<p class="mt-1 text-xs text-gallery-500">
					{cl.description.length > 120
						? cl.description.slice(0, 120) + '...'
						: cl.description}
				</p>
			{/if}
			{#if cl.keywords?.length > 0}
				<div class="mt-2 flex flex-wrap gap-1">
					{#each cl.keywords.slice(0, 6) as kw}
						<span
							class="rounded bg-accent-100 px-1.5 py-0.5 text-[10px] text-accent-700"
						>
							{kw}
						</span>
					{/each}
				</div>
			{/if}
			<p class="mt-1.5 text-[11px] text-gallery-400">{cl.filmCount} films</p>
		{/if}
	</div>
{/if}
