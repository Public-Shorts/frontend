<script>
	import EventCard from '$lib/components/events/EventCard.svelte';
	import GridLayout from '../how-to-get-there/GridLayout.svelte';
</script>

<GridLayout>
	<h1 class="col-span-5 col-start-2 text-3xl font-bold sm:text-4xl">Events</h1>
	<h2 class="col-span-1 col-start-1 text-lg font-semibold sm:text-xl">24/7 Window</h2>
	<span class="col-span-3 col-start-2">
		<p>
			The 24/7 video festival takes place in Berlin from February 27 to March 15 at this location:
		</p>
		<a href="https://maps.app.goo.gl/UVtYxpk5eqgVbmjP6">Hobrechstraße 54, 12047 Berlin</a>.
	</span>
	<div class="col-span-2"></div>

	<h2 class="col-span-1 col-start-1 text-lg font-semibold sm:text-xl">Screening events</h2>
	<div class="col-span-3">
		<p>
			In addition to the continuous screening, three special in-person events feature Q&As, debates,
			and discussions.
		</p>
		<div class="grid gap-4 sm:grid-cols-1">
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
	<div class="col-span-2"></div>
</GridLayout>
