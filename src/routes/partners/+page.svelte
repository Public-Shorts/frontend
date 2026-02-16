<script lang="ts">
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { urlFor } from '$lib/sanity';

	let { data } = $props();
	const partners = data.festivalSettings?.partners ?? [];
	const contactEmail = data.festivalSettings?.contactEmail ?? 'hi@publicshorts.org';
</script>
<SEO title="Partners" />

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Partners</h1>

	<div class="font-semibold md:col-span-1">Venue Partners</div>
	<div class="md:col-span-5">
		<p class="mb-12">
			We are grateful for the support of our partners who help make the 24/7 Video Festival
			possible. If you are interested in becoming a partner, please reach out to us at
			<a href="mailto:{contactEmail}">{contactEmail}</a>
		</p>
		{#if partners.length > 0}
			<div class="mt-6 flex flex-col items-start gap-8 md:grid md:grid-cols-3">
				{#each partners as partner (partner._key)}
					<a
						href={partner.url ?? '#'}
						class="flex items-center justify-center saturate-0 transition duration-300 hover:saturate-100"
						target="_blank"
						rel="noreferrer"
					>
						{#if partner.logo?.asset}
							<img
								src={urlFor(partner.logo).height(64).auto('format').url()}
								alt="{partner.name} Logo"
								class="max-h-16 w-auto object-contain"
							/>
						{:else}
							<span class="text-sm text-gallery-500">{partner.name}</span>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
	<div class="hidden md:col-span-2 md:block"></div>
</GridLayout>
