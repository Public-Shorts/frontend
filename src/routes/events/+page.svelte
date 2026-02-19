<script lang="ts">
	import EventCard from '$lib/components/events/EventCard.svelte';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<SEO title="Events" />

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Events</h1>
	<div class="font-semibold md:col-span-1">24/7 Window</div>
	<div class="md:col-span-3">
		<p>
			The 24/7 video festival takes place in Berlin from February 27 to March 15 at this location:
		</p>
		<a
			href="https://maps.app.goo.gl/ik5tm9Xrx9MPuDnRA"
			class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
			>Hobrechstraße 54, 12047 Berlin</a
		>.
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	{#if data.screenings.length > 0}
		<div class="font-semibold md:col-span-1">Screening events</div>
		<div class="md:col-span-3">
			<p>
				In addition to the continuous screening, special in-person events feature Q&As, debates, and
				discussions. We would like to thank <a href="https://www.kino-bar.berlin/mieten"
					>Kino Bar Könighstadt</a
				> for hosting these events in their cozy cinema space. Please check back for updates on the schedule
				and lineup of these events.
			</p>
			<div class="grid gap-4 md:grid-cols-1">
				{#each data.screenings as screening}
					<EventCard
						title={screening.title}
						date={formatDate(screening.date)}
						location={screening.location}
						href="/events/{screening.slug}"
					/>
				{/each}
			</div>
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}
</GridLayout>
