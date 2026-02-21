<script lang="ts">
	let {
		title,
		date,
		location,
		duration,
		link,
		href
	}: {
		title: string;
		date: string;
		location: string;
		duration?: string | null;
		link?: string;
		href?: string;
	} = $props();
</script>

<div
	class="group grid grid-cols-1 border-r-2 border-gallery-600 p-4 px-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500 hover:bg-gallery-100 hover:shadow-md sm:grid-cols-12 sm:items-baseline"
>
	<div class="sm:col-span-12">
		<span class="text-xs tracking-widest text-gallery-400 uppercase">
			{date}
		</span>
	</div>

	<div class="sm:col-span-12">
		{#if href}
			<a
				{href}
				class="inline-block text-sm font-medium text-gallery-900 transition-colors
				       hover:text-accent-500 focus-visible:ring-2 focus-visible:ring-accent-400
				       focus-visible:ring-offset-2 focus-visible:ring-offset-gallery-100 focus-visible:outline-none"
			>
				{title}
			</a>
		{:else if link}
			<a
				href={link}
				class="inline-block text-sm font-medium text-gallery-900 transition-colors
				       hover:text-accent-500 focus-visible:ring-2 focus-visible:ring-accent-400
				       focus-visible:ring-offset-2 focus-visible:ring-offset-gallery-100 focus-visible:outline-none"
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
		<span class="text-xs tracking-widest text-gallery-400 uppercase">
			{location}
		</span>
		{#if duration}
			<span class="text-xs tracking-widest text-gallery-400 uppercase">
				— {duration}
			</span>
		{/if}
	</div>
</div>
