<script lang="ts">
	import GridLayout from '$lib/components/GridLayout.svelte';
	import Logo from '$lib/components/logo/logo.svelte';
	import ImageCarousel from '$lib/components/ImageCarousel.svelte';
	import EventCard from '$lib/components/events/EventCard.svelte';

	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/festival');
	});
</script>

<!-- Hero -->
<!-- Removed border-b. Changed grid to stack vertically on desktop (rows) or use col-span-6 -->
<div class="flex flex-col md:col-span-6">
	<!-- Image: Full width header (col-span-6) with cinematic aspect ratio -->
	<div class="w-full">
		<div class="aspect-video max-h-120 w-full overflow-hidden bg-black">
			<ImageCarousel
				images={[
					{
						src: '/images/Pictures/window/window-pics-02.png',
						alt: 'Window at Kanapé with CRT-TV'
					},
					{
						src: '/images/Pictures/window/window-pics-01.png',
						alt: 'Window at Kanapé with CRT-TV'
					},
					{
						src: '/images/Pictures/window/window-pics-03.png',
						alt: 'Window at Kanapé with CRT-TV'
					},
					{
						src: '/images/Pictures/window/window-pics-04.png',
						alt: 'Window at Kanapé with CRT-TV'
					}
				]}
			/>
		</div>
	</div>
</div>
<GridLayout>
	<div class="flex flex-col md:col-span-5 md:col-start-2">
		<!-- Text: Full width container, arranged for readability -->
		<div class="flex flex-col gap-4 md:gap-6"></div>
		<!-- Title - Scaled up for mobile impact (text-4xl) and massive on desktop -->
		<h1 class="text-4xl leading-tight font-semibold tracking-tight md:text-8xl md:leading-[0.9]">
			24/7 Video Festival
		</h1>

		<!-- Info block: Grid on desktop to align dates and description side-by-side -->
		<div class="flex flex-col gap-3 md:grid md:grid-cols-6 md:gap-8"></div>
		<div class="md:col-span-2">
			<p class="text-lg font-medium md:text-xl">February 27 – March 15, 2026 · Berlin</p>
		</div>
		<div class="md:col-span-3 md:col-start-4">
			<p class="text-base leading-relaxed text-gallery-100 md:text-lg">
				A continuous loop of short films, video art, documentary, animation and experimental works
				on street-facing screens at Kanapé, plus three in-person screening events.
			</p>
		</div>
	</div>

	<!-- Open Call -->
	<div class="font-semibold md:col-span-1 md:mt-16" id="open-call">Open Call for Submissions</div>

	<div class=" md:col-span-3 md:mt-16">
		<div
			class="mb-6 flex h-14 w-full items-center justify-center border-l-4 border-black bg-white text-black"
		>
			<p class="font-semibold">December 12, 2025 – January 10, 2026</p>
		</div>
		<p class="mb-6 leading-relaxed">
			We welcome all types of video works under 15 minutes, made in the past 3 years: film, video
			art, documentary, animation, and experimental formats.
		</p>
	</div>

	<!-- Button -->
	<a
		href="/opencall"
		class="mb-12 flex h-14 items-center justify-center border border-gallery-900 bg-transparent font-medium text-white transition-colors hover:opacity-80 md:col-span-2 md:mt-16"
	>
		Submit your work
	</a>

	<!-- Festival Dates -->
	<div class=" font-semibold md:col-span-1 md:mb-0" id="festival-dates">2026 Festival Dates</div>

	<div class="mb-10 flex flex-col gap-4 md:col-span-3 md:gap-6">
		<div class="grid grid-cols-1 gap-1 md:grid-cols-[1fr_2fr] md:gap-4">
			<span class="">Festival</span>
			<span>February 27 – March 15, 2026</span>
		</div>
		<div class="grid grid-cols-1 gap-1 md:grid-cols-[1fr_2fr] md:gap-4">
			<span class="">Location (24/7 loop)</span>
			<span>
				<a
					href="https://maps.app.goo.gl/UKxpSPXeA9ud5hyWA"
					target="_blank"
					rel="noreferrer"
					class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
				>
					Kanapé, Hobrechtstraße 54, 12047 Berlin
				</a>
			</span>
		</div>
	</div>

	<!-- Events -->
	<div class="mb-16 grid gap-4 md:col-span-2">
		<EventCard
			title="Festival Opening & First Screening"
			date="Fri, 27 Feb 2026, 19:00"
			location="TBA, Berlin"
		/>
		<EventCard
			title="Second Screening Session"
			date="Fri, 6 Mar 2026, 19:00"
			location="TBA, Berlin"
		/>
		<EventCard
			title="Festival Closing & Last Screening"
			date="Fri, 13 Mar 2026, 19:00"
			location="TBA, Berlin"
		/>
	</div>
</GridLayout>
