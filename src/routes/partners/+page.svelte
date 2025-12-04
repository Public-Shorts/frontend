<script>
	import GridLayout from '$lib/components/GridLayout.svelte';
</script>

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Partners</h1>

	<div class="font-semibold md:col-span-1">Venue Partners</div>
	<div class="md:col-span-3">
		<p class="mb-6">
			We are grateful for the support of our partners who help make the 24/7 Video Festival
			possible.
		</p>
		<div class="grid grid-cols-2 items-center gap-6">
			<a
				href="https://kanape.studio/"
				class="flex items-center justify-center saturate-0 transition duration-300 hover:saturate-100"
			>
				<img
					src="/images/partners/kanape.png"
					alt="Kanapé Logo"
					class="max-h-16 w-auto object-contain"
				/>
			</a>

			<a
				href="https://zoenoteka.com"
				class="flex items-center justify-center saturate-0 transition duration-300 hover:saturate-100"
			>
				<img
					src="/images/partners/zonoteka.png"
					alt="Zönoteka Logo"
					class="max-h-16 w-auto object-contain"
				/>
			</a>
		</div>
	</div>
	<div class="hidden md:col-span-2 md:block"></div>
</GridLayout>
