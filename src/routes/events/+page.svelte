<script>
	import EventCard from '$lib/components/events/EventCard.svelte';
</script>

<div class="pb-8">
	The 24/7 video festival takes place in Berlin from February 27 to March 15 at this location:
	<a href="https://maps.app.goo.gl/UVtYxpk5eqgVbmjP6">Hobrechstraße 54, 12047 Berlin</a>.
</div>
<h2 class="text-lg font-semibold sm:text-xl">Events</h2>
<p>
	In addition to the continuous screening, three special in-person events feature Q&As, debates, and
	discussions.
</p>
<div class="grid gap-4 sm:grid-cols-1">
	<EventCard
		title="Festival Opening &amp; First Screening"
		date="Fri, 27 Feb 2026, 19:00"
		location="TBD, Berlin"
	/>
	<EventCard
		title="Second Screening Session"
		date="Fri, 6 Mar 2026, 19:00"
		location="TBD, Berlin"
	/>
	<EventCard
		title="Festival Closing &amp; Last Screening"
		date="Fri, 13 Mar 2026, 19:00"
		location="TBD, Berlin"
	/>
</div>
