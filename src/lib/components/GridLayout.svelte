<script>
	let { children } = $props();
</script>

<div class="flex w-full justify-center px-4">
	<section
		class="leading-snugged grid w-full max-w-5xl grid-cols-1 gap-6 gap-y-10 py-12 text-base md:grid-cols-6 md:py-20"
	>
		{@render children()}
	</section>
</div>

<style>
	:global(p) {
		margin-bottom: 12px;
	}
</style>
