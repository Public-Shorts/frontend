<script>
	import GridLayout from '$lib/components/GridLayout.svelte';
	import Map from '$lib/components/Map.svelte';
</script>

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">How to get there</h1>
	<div class="w-full md:col-span-3">
		<Map />
	</div>
	<div class="w-full md:col-span-3">
		<p>
			The festival takes place at <a
				href="https://goo.gl/maps/3JvX9y6YFz52"
				target="_blank"
				rel="noreferrer"
				class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				>Hobrechstraße 54, 12047 Berlin</a
			>.
		</p>
		<p>
			The window is on the ground floor and faces the street. It is accessible for people with
			reduced mobility.
		</p>
		<p>
			The venue is easily accessible by public transport. The nearest U-Bahn station is
			<a
				href="https://maps.app.goo.gl/2GEXL7SohSmCxwJg9"
				target="_blank"
				rel="noreferrer"
				class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				>Schönleinstraße</a
			>on the U8 line, about 5 minutes walk from the location.
		</p>
	</div>
</GridLayout>
