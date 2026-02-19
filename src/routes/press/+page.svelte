<script>
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();
	const contactEmail = data.festivalSettings?.contactEmail ?? 'hi@publicshorts.org';
</script>

<SEO title="Press" />
<div class="col-span-2"></div>
<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Press</h1>
	<p class="col-span-3 col-start-2">
		<a
			class="text-gallery-900"
			href="https://drive.google.com/drive/folders/1PPWsrNC9_jV8-v63BC3NUzM5f9qpfCIa?usp=sharing"
			>Press package for logo, photos etc.</a
		>
		For any questions please contact
		<a class="text-gallery-900" href="mailto:{contactEmail}">{contactEmail}</a> and mention "press" in
		the subject.
	</p>
	<div class="col-span-3 col-start-2 mt-4">
		<a
			href="/press/kit"
			class="inline-block border border-gallery-900 px-6 py-2 text-sm font-medium text-gallery-900 no-underline transition-all duration-200 hover:text-gallery-50 hover:opacity-75 hover:shadow-md"
		>
			Download Press Kit (PDF)
		</a>
	</div>
</GridLayout>
