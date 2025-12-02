<script lang="ts">
	import EventCard from '$lib/components/events/EventCard.svelte';
</script>

<div class="flex w-full justify-center px-4">
	<section
		class="leading-snugged grid w-full max-w-5xl grid-cols-1 gap-6 gap-y-10 py-12 text-base md:grid-cols-6 md:py-20"
	>
		<h1 class=" text-3xl font-bold md:col-span-5 md:col-start-2">Festival</h1>
		<div class="font-semibold md:col-span-1">Concept</div>
		<div class="md:col-span-3">
			Public Shorts is a 24/7 video festival taking place in Berlin from February 27 to March 15,
			2026. Throughout the festival, the curated selection plays on loop on screens visible through
			the glass windows at
			<a
				class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				href="https://maps.app.goo.gl/UKxpSPXeA9ud5hyWA"
				target="_blank"
				rel="noreferrer"
			>
				Kanapé
			</a>
			(Hobrechstraße 54, 12047 Berlin), accessible to anyone passing by at any time of day or night.
		</div>
		<div class="content cover aspect-[3/4] md:col-span-2">
			<img
				src="/images/Pictures/window/window-pics-02.png"
				alt="Window at Kanapé with CRT-TV"
				class="h-full w-full rounded-md object-cover"
			/>
		</div>

		<div class="font-semibold md:col-span-1">Events</div>
		<div class="md:col-span-3">
			In addition to the continuous screening, three special in-person events feature Q&amp;As,
			debates, and discussions:
		</div>
		<div class="md:col-span-2">
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

		<div class="font-semibold md:col-span-1">Open Call & Selection</div>
		<div class="md:col-span-3">
			All types of video media under 15 minutes are welcome: film, video, documentary, animation,
			and experimental formats. The festival is curated by a diverse team of curators who
			collectively shape the selection through open call submissions.
		</div>
		<div class="grid grid-cols-2 gap-4 md:col-span-2 md:gap-6">
			<div class="aspect-video bg-radial/hsl from-gallery-500 to-accent-300"></div>
			<div class="aspect-video bg-linear-to-tl/hsl from-gallery-400 to-accent-400"></div>
			<div class="aspect-video bg-linear-to-br/hsl from-gallery-300 to-accent-500"></div>
			<div class="aspect-video bg-conic/hsl from-gallery-200 to-accent-600"></div>
		</div>

		<div class="font-semibold md:col-span-1">Team</div>
		<div class="md:col-span-3">
			Célestin Meunier, Manus Nijhoff, Sena Doğan, Lilli Grube, and Su Durakbaşa.
		</div>
		<div class="hidden md:col-span-2 md:block"></div>

		<div class="font-semibold md:col-span-1">Curatorial Team</div>
		<div class="md:col-span-3">
			Federico Zurani, Manus Nijhoff, Mario Guzman, Juyeong Park, Stratos Bichakis, Christina
			Pitiakoudi, Sena Doğan, Edlin Jap, Lorenzo Tani, Engy El Shenawy, Josue Flores, Moritz Weber,
			Lilli Grube, Elisabeth Scholz, Pietro Lugaro, Su Durakbaşa.
		</div>
		<div class="hidden md:col-span-2 md:block"></div>

		<div class="font-semibold md:col-span-1">Jury</div>
		<div class="md:col-span-3">Jamie Allen, Nina Fischer, Luce Delire, and Rachel Uwa.</div>
		<div class="hidden md:col-span-2 md:block"></div>

		<div class="font-semibold md:col-span-1">Thanks</div>
		<div class="md:col-span-3">
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
		</div>
		<div class="hidden md:col-span-2 md:block"></div>

		<div class="font-semibold md:col-span-1">Donation</div>
		<div class="md:col-span-3">
			Donations help support the festival and its activities. You can donate via PayPal at
			<a
				href="https://paypal.me/publicshorts"
				class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				target="_blank"
				rel="noreferrer"
			>
				paypal.me/publicshorts
			</a>.
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	</section>
</div>
