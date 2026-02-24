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
		class="pointer-events-none fixed z-50 max-w-xs rounded-md border border-gallery-200 bg-gallery-50 px-3 py-2.5 shadow-md"
		style="left: {position.left}px; top: {position.top}px;"
		transition:fade={{ duration: 80 }}
	>
		{#if node.type === 'film'}
			{@const film = node.data as any}
			<div class="flex items-baseline gap-2">
				<span
					class="relative -top-px inline-block h-2 w-2 shrink-0 rounded-full"
					style="background: {node.color}"
				></span>
				<span class="text-sm font-semibold leading-tight text-gallery-800">
					{film.englishTitle}
				</span>
			</div>
			{#if film.directorName || film.length}
				<span class="mt-1.5 block pl-4 text-[11px] leading-none text-gallery-500">
					{#if film.directorName}{film.directorName}{/if}
					{#if film.directorName && film.length}
						<span class="mx-1 text-gallery-300">·</span>
					{/if}
					{#if film.length}{film.length} min{/if}
				</span>
			{/if}
		{:else if node.type === 'meta-category'}
			{@const mc = node.data as any}
			<div class="flex items-baseline gap-2">
				<span
					class="relative -top-px inline-block h-2 w-2 shrink-0 rounded-sm"
					style="background: {node.color}"
				></span>
				<span class="text-sm font-semibold leading-tight text-gallery-800">{mc.name}</span>
			</div>
			<span class="mt-1.5 block pl-4 text-[11px] leading-none text-gallery-400">{mc.filmCount} films</span>
		{:else if node.type === 'cluster'}
			{@const cl = node.data as any}
			<div class="flex items-baseline gap-2">
				<span
					class="relative -top-px inline-block h-2 w-2 shrink-0 rotate-45 rounded-sm"
					style="background: {node.color}"
				></span>
				<span class="text-sm font-semibold leading-tight text-gallery-800">{cl.name}</span>
			</div>
			<span class="mt-1.5 block pl-4 text-[11px] leading-none text-gallery-400">{cl.filmCount} films</span>
		{:else if node.type === 'screening'}
			{@const sc = node.data as any}
			<div class="flex items-baseline gap-2">
				<svg class="relative -top-px h-2 w-2 shrink-0" viewBox="0 0 10 10">
					<polygon points="5,0 10,8.66 0,8.66" fill={node.color} />
				</svg>
				<span class="text-sm font-semibold leading-tight text-gallery-800">{sc.name}</span>
			</div>
			<span class="mt-1.5 block pl-4 text-[11px] leading-none text-gallery-400">{sc.filmCount} films</span>
		{/if}
	</div>
{/if}
