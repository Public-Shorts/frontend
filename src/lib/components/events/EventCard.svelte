<script lang="ts">
	let {
		title,
		date,
		location,
		link
	}: { title: string; date: string; location: string; link?: string } = $props();
</script>

<div
	class="group grid grid-cols-1 gap-2 border-t border-gallery-200 py-4 first:border-t-0
           sm:grid-cols-12 sm:items-baseline sm:gap-4 sm:py-5"
>
	<!-- Date -->
	<div class="sm:col-span-3">
		<span class="text-xs font-medium tracking-[0.18em] text-gallery-500 uppercase">
			{date}
		</span>
	</div>

	<!-- Title (optionally clickable) -->
	<div class="sm:col-span-6">
		{#if link}
			<a
				href={link}
				class="inline-block text-base font-medium text-gallery-900 transition-colors
                       hover:text-accent-500 focus-visible:ring-2
                       focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gallery-100
                       focus-visible:outline-none"
			>
				{title}
			</a>
		{:else}
			<h3 class="text-base font-medium text-gallery-900">
				{title}
			</h3>
		{/if}
	</div>

	<!-- Location -->
	<div class="sm:col-span-3 sm:text-right">
		<span class="text-sm text-gallery-500">
			{#if location === 'Hobrechstraße 54, 12047 Berlin'}
				<a href="https://maps.app.goo.gl/UVtYxpk5eqgVbmjP6" target="_blank" rel="noreferrer"
					>{location}</a
				>
			{:else}
				<!-- else content here -->
				{location}
			{/if}
		</span>
	</div>
</div>
