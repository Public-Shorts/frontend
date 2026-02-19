<script lang="ts">
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="Schedule"
	description="The screening schedule for Public Shorts, the 24/7 Video Festival in Berlin."
/>

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Schedule</h1>
	<div class="md:col-span-3 md:col-start-2">
		<p class="text-gallery-600">
			The screening schedule is not yet available. It will be published closer to the start of
			the festival.
		</p>
		<p>
			Check our <a
				href="/events"
				class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				>events page</a
			> for upcoming screenings and special events.
		</p>
	</div>
</GridLayout>
