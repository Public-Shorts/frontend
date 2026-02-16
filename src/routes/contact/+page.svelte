<script>
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO title="Contact" />

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Contact</h1>
	<div class="font-semibold md:col-span-1">Email</div>
	<div class="md:col-span-3">
		<a
			href="mailto:hi@publicshorts.org"
			class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
		>
			hi@publicshorts.org
		</a>
	</div>
	<div class="hidden md:col-span-2 md:block"></div>
</GridLayout>
