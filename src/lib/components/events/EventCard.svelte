<script lang="ts">
	let {
		title,
		date,
		location,
		link,
		href
	}: { title: string; date: string; location: string; link?: string; href?: string } = $props();
</script>

<div
	class="group grid grid-cols-1 border-r-2 border-gallery-600 pb-4 sm:grid-cols-12 sm:items-baseline"
>
	<div class="sm:col-span-12">
		<span class="text-xs tracking-widest text-gallery-400">
			{date}
		</span>
	</div>

	<div class="sm:col-span-12">
		{#if href}
			<a
				{href}
				class="inline-block text-base font-medium text-gallery-900 transition-colors
				       hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2
				       focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gallery-100"
			>
				{title}
			</a>
		{:else if link}
			<a
				href={link}
				class="inline-block text-base font-medium text-gallery-900 transition-colors
				       hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2
				       focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gallery-100"
			>
				{title}
			</a>
		{:else}
			<h3 class="text-sm text-gallery-900">
				{title}
			</h3>
		{/if}
	</div>

	<div class="sm:col-span-12">
		<span class="text-xs tracking-widest text-gallery-400">
			{location}
		</span>
	</div>
</div>
