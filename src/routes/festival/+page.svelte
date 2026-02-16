<script lang="ts">
	import ImageCarousel from '../../lib/components/ImageCarousel.svelte';

	import EventCard from '$lib/components/events/EventCard.svelte';
	import GridLayout from '../../lib/components/GridLayout.svelte';
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
<SEO />

<GridLayout>
	<h1 class=" text-3xl font-bold md:col-span-5 md:col-start-2">Festival</h1>
	<div class="font-semibold md:col-span-1">Concept</div>
	<div class="md:col-span-3">
		Public Shorts is a 24/7 video festival taking place in Berlin from February 27 to March 15,
		2026. Throughout the festival, the curated selection plays on loop on screens visible through
		the glass windows at
		<a
			class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
			href="https://maps.app.goo.gl/ik5tm9Xrx9MPuDnRA"
			target="_blank"
			rel="noreferrer"
		>
			Hobrechstraße 54, 12047 Berlin
		</a>, accessible to anyone passing by at any time of day or night.
	</div>
	<div class="content cover aspect-3/4 md:col-span-2">
		<ImageCarousel
			images={[
				{ src: '/images/Pictures/window/window-pics-02.png', alt: 'Window at Kanapé with CRT-TV' },
				{ src: '/images/Pictures/window/window-pics-01.png', alt: 'Window at Kanapé with CRT-TV' },
				{ src: '/images/Pictures/window/window-pics-03.png', alt: 'Window at Kanapé with CRT-TV' },
				{ src: '/images/Pictures/window/window-pics-04.png', alt: 'Window at Kanapé with CRT-TV' }
			]}
		/>
	</div>

	{#if data.screenings.length > 0}
		<div class="font-semibold md:col-span-1">Events</div>
		<div class="md:col-span-3">
			In addition to the continuous display in the window, special in-person events feature Q&amp;As,
			debates, and discussions:
		</div>
		<div class="md:col-span-2">
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
	{/if}

	<div class="font-semibold md:col-span-1">Open Call & Selection</div>
	<div class="md:col-span-3">
		<p>
			All types of video media under 15 minutes, made in the past 3 years are welcome: film, video,
			documentary, animation, and experimental formats. The festival is curated by a diverse team of
			curators who collectively shape the selection through open call submissions.
		</p>
		<p>
			See the
			<a href="/opencall"> open call for submissions </a>
			for the 2026 edition.
		</p>
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
	<div class="md:col-span-3">
		<a href="https://jamieallen.com/">Jamie Allen</a>,
		<a href="https://getaphilosopher.com/luce_delire/">Luce Delire</a>,
		<a href="https://www.fischerelsani.net/">Nina Fischer</a>,
		<a href="https://www.schoolofma.org/people/rachel-uwa">Rachel Uwa</a>, and
		<a href="https://www.fwuest.com/"> Florian Wüst</a>.
	</div>
	<div class="hidden md:col-span-2 md:block"></div>

	<div class="font-semibold md:col-span-1">Thanks</div>
	<div class="md:col-span-3">
		Thanks to Kanapé for hosting and the technical support, and to all our
		<a
			href="/partners"
			class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
		>
			partners
		</a>
		and supporters, and to all the artists submitting their works. Special thanks to
		<a href="https://www.fwuest.com/"> Florian Wüst </a>
		for his support and advising throughout the whole process.
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
</GridLayout>
