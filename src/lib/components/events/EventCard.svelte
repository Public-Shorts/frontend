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

	const cardClass = "group grid grid-cols-1 border-r-2 border-gallery-600 p-4 px-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500 hover:bg-gallery-100 hover:shadow-md sm:grid-cols-12 sm:items-baseline bg-white focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:outline-none";
</script>

{#snippet cardContent()}
	<div class="sm:col-span-12">
		<span class="text-xs tracking-widest text-gallery-400 uppercase">
			{date}
		</span>
	</div>

	<div class="sm:col-span-12">
		<span class="text-xl font-semibold text-gallery-900 group-hover:text-accent-500 transition-colors">
			{title}
		</span>
	</div>

	<div class="sm:col-span-12">
    <span class="text-xs tracking-widest text-gallery-400 uppercase">
      INFO & TICKETS
    </span>
	</div>
{/snippet}

{#if href}
	<a {href} class={cardClass}>
		{@render cardContent()}
	</a>
{:else if link}
	<a href={link} class={cardClass}>
		{@render cardContent()}
	</a>
{:else}
	<div class={cardClass}>
		{@render cardContent()}
	</div>
{/if}

<style>
	a {
		text-decoration: none;
	}
</style>
