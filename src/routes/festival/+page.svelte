<script lang="ts">
	import EventCard from '$lib/components/events/EventCard.svelte';
</script>

<section class="prose w-full grid-cols-1 text-gallery-800 lg:grid-cols-2">
	<header class="">
		<p class="">
			Public Shorts is a 24/7 video festival taking place in Berlin from February 27 to March 15,
			2026.
		</p>
		<p>
			Throughout the festival, the curated selection plays on loop on screens visible through the
			glass windows at
			<a
				class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				href="https://maps.app.goo.gl/UKxpSPXeA9ud5hyWA"
				target="_blank"
				rel="noreferrer"
			>
				Kanapé
			</a>
			(Hobrechstraße 54, 12047 Berlin), accessible to anyone passing by at any time of day or night.
		</p>
	</header>

	<section class="">
		<h2 class="text-xl sm:text-xl">Events</h2>
		<p>
			In addition to the continuous screening, three special in-person events feature Q&amp;As,
			debates, and discussions:
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
	</section>

	<section class="">
		<h2 class="text-xl sm:text-xl">Open call & selection</h2>
		<p>
			All types of video media under 15 minutes are welcome: film, video, documentary, animation,
			and experimental formats.
		</p>
		<p>
			The festival is curated by a diverse team of curators who collectively shape the selection
			through open call submissions.
		</p>
	</section>

	<section class="">
		<h2 class="text-xl sm:text-xl">Team</h2>
		<p>
			Public Shorts is organized by Célestin Meunier, Manus Nijhoff, Sena Doğan, Lilli Grube, and Su
			Durakbaşa.
		</p>
	</section>
	<section class="">
		<h2 class="text-xl sm:text-xl">Curated</h2>
		<p>
			The curation teams for the 2026 edition are: Federico Zurani, Manus Nijhoff, Mario Guzman,
			Juyeong Park, Stratos Bichakis, Christina Pitiakoudi, Sena Doğan, Edlin Jap, Lorenzo Tani,
			Engy El Shenawy, Josue Flores, Moritz Weber, Lilli Grube, Elisabeth Scholz, Pietro Lugaro.
		</p>
	</section>

	<section class="">
		<h2 class="text-xl sm:text-xl">Jury</h2>
		<p>The festival's jury includes Jamie Allen, Nina Fischer, Luce Delire, and Rachel Uwa.</p>
	</section>

	<section class="">
		<h2 class="text-xl sm:text-xl">Thanks</h2>
		<p>
			Special thanks to Zönoteka for hosting, and to all
			<a
				href="/partners"
				class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
			>
				partners
			</a>
			and supporters. Many thanks to
			<a
				href="https://www.fwuest.com/"
				class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				target="_blank"
				rel="noreferrer"
			>
				Florian Wüst
			</a>
			for support and advising.
		</p>
	</section>

	<section class="">
		<h2 class="text-xl sm:text-xl">Donation</h2>
		<p>
			Donations help support the festival and its activities. You can donate via PayPal at
			<a
				href="https://paypal.me/publicshorts"
				class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				target="_blank"
				rel="noreferrer"
			>
				paypal.me/publicshorts
			</a>.
		</p>
	</section>
</section>
