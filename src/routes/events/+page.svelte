<script>
	import EventCard from '$lib/components/events/EventCard.svelte';
	import GridLayout from '$lib/components/GridLayout.svelte';
</script>

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Events</h1>
	<div class="font-semibold md:col-span-1">24/7 Window</div>
	<div class="md:col-span-3">
		<p>
			The 24/7 video festival takes place in Berlin from February 27 to March 15 at this location:
		</p>
		<a
			href="https://maps.app.goo.gl/UVtYxpk5eqgVbmjP6"
			class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
			>Hobrechstraße 54, 12047 Berlin</a
		>.
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	<div class="font-semibold md:col-span-1">Screening events</div>
	<div class="md:col-span-3">
		<p>
			In addition to the continuous screening, three special in-person events feature Q&As, debates,
			and discussions.
		</p>
		<div class="grid gap-4 md:grid-cols-1">
			<EventCard
				title="Festival Opening &amp; First Screening"
				date="Fri, 27 Feb 2026, 19:00"
				location="TBA, Berlin"
			/>
			<EventCard
				title="Second Screening Session"
				date="Fri, 6 Mar 2026, 19:00"
				location="TBA, Berlin"
			/>
			<EventCard
				title="Festival Closing &amp; Last Screening"
				date="Fri, 13 Mar 2026, 19:00"
				location="TBA, Berlin"
			/>
		</div>
	</div>
	<div class="hidden md:col-span-2 md:block"></div>
</GridLayout>
