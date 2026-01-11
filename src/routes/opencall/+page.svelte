
<script>
	import SEO from '$lib/components/SEO.svelte';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import ImageCarousel from '$lib/components/ImageCarousel.svelte';
	import { goto } from '$app/navigation';

	const openCallDate = new Date('2025-12-12T15:00:00');
	const openCallDeadline = new Date('2026-01-11T23:59:59');
	const today = new Date();
	// check if the current date is past the open call date
	const isPastOpenCall = today > openCallDate;
	const isBeforeDeadline = today < openCallDeadline;
	const isAfterDeadline = today > openCallDeadline;
</script>
<SEO title="Open Call" />

{#if isBeforeDeadline}
<GridLayout>
	<h1 class="mb-4 text-3xl font-bold md:col-span-5 md:col-start-2">Open Call</h1>
	<div class="md:col-span-4 md:col-start-2 aspect-video ">
		<img
				src="/images/Pictures/window/large-photo.JPG"
				alt="Window at Kanapé with CRT-TV"
				class="h-full w-full object-cover transition-opacity duration-300"
			/>
	</div>
	<div class="font-semibold md:col-span-1"></div>
	<div class="md:col-span-1"></div>
	<div class="md:col-span-4 ">
		<button on:click={()=>goto('/submit')} disabled={!isPastOpenCall && isBeforeDeadline} class="inline-block px-8 py-3 border-2 border-black disabled:border-0 text-current font-semibold hover:opacity-75  transition-colors duration-300 disabled:bg-gallery-400 disabled:text-gallery-100 cursor-pointer">Submit a video</button>
		{#if !isPastOpenCall}
			<p class="pt-2 text-gallery-500 ">The open call will open on December 12, 2025 at 17:00.</p>
		{/if}
		{#if isAfterDeadline}
			<p class="pt-2 text-gallery-500 ">The open call has now closed.</p>
		{/if}
	</div>
	<div class="md:col-span-1"></div>
	<div class="font-semibold md:col-span-1"></div>
	<div class="md:col-span-4">
		Public Shorts is a 24/7 short video festival in Berlin, presenting a curated loop of films in a public-facing window, so anyone can watch from the street, day and night. Submit your short film, documentary, animation, or experimental video under 15 minutes to be part of the 2026 edition.
	</div>
	<div class="md:col-span-1">
	</div>
	<div class="font-semibold md:col-span-1">Who can submit</div>
	<div class="md:col-span-3">
		Everyone: artists, filmmakers, collectives, students, professionals, amateurs, anyone working with moving image.
	</div>
	<div class="md:col-span-2"></div>
	<div class="font-semibold md:col-span-1">Submission requirements</div>
	<div class="md:col-span-3">
		Works must be under 15 minutes in length.<br/>
		Produced within the last 3 years (2023 or later).<br/>
		Any format or genre of short video is welcome.
	</div>
<div class="md:col-span-2"></div>
	<div class="font-semibold md:col-span-1">What you get</div>
	<div class="md:col-span-3">
		<ul class="list-disc pl-5">
			<li>Continuous screening of your work in Berlin for the full festival period in the window.</li>
			<li>Your work considered by a diverse team of curators, a jury, with the final program shaped through the open call.</li>
			<li>The chance to be part of in‑person screenings with Q&As and discussions.</li>
		</ul>
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

	<div class="font-semibold md:col-span-1">Key info in brief</div>
	<div class="md:col-span-3">
		Festival location: Hobrechtstraße 54, 12047 Berlin.<br/>
		Festival dates: February 27 – March 15, 2026.<br/>
		Open call period: December 12 – January 10.
	</div>
	<div class="md:col-span-2"></div>

	<div class="font-semibold md:col-span-1">How to submit</div>
	<div class="md:col-span-3">
		<p>Use the <a href={!isPastOpenCall ? "/submit" : ""}>submission form</a> to send: a streaming link (with password if needed), a short synopsis, runtime, year, and basic credits. After curation in January–February, all artists are informed and selected works receive tech and event details.</p>
		<p>For more information, you can checkout our <a href="/FAQ">FAQ</a></p>
	</div>
	
</GridLayout>
	 <!-- content here -->
{:else}
	 <!-- else if content here -->
	<GridLayout>
	<h1 class="mb-4 text-3xl font-bold md:col-span-5 md:col-start-2">Open Call</h1>
	<div class="font-semibold md:col-span-1"></div>
	<div class="md:col-span-3">
		The open call for Public Shorts 2026 is now closed. Thank you to all the artists who submitted their work! Keep an eye on our <a href="/programme">programme page</a> for the announcement of the selected videos.
	</div>
	<div class="md:col-span-2">
	</div>
	</GridLayout>
{/if}


