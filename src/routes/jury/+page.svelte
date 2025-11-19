<script>
	import Logo from '$lib/components/logo/logo.svelte';
</script>

<div class="relative flex w-screen items-center bg-zinc-900 p-4">
	<div class="z-10 flex max-w-2xl flex-col gap-4 text-zinc-400">
		<a href="/" class="mb-4 w-32 fill-zinc-100">
			<Logo />
		</a>
		<h1 class="text-2xl font-bold text-zinc-100">
			Public Shorts: Video Festival in Berlin 2026, Curated by <em>you?</em>
		</h1>

		<p class=" text-zinc-100">
			Hi, if you’ve received this very secret link, it’s because you’re invited to serve on the jury
			of the upcoming <span class="italic">Public Shorts</span> video festival.
		</p>
		<div class="z-0 w-full p-4 lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-1/2">
			<img src="/images/Pictures/A4 - 25.png" alt="Illustration window" class="" />
		</div>

		<h2 class=" text-xl font-semibold text-zinc-100">What is Public Shorts?</h2>
		<p class="">
			We are organizing a 24/7 video festival, which will take over the screens inside the glass
			window of
			<a href="https://kanape.studio/" class="text-blue-600 underline">kanapé</a>. Anyone passing by
			can come and watch the shorts throughout the festival period.
		</p>
		<p class="">
			In addition, we will host three in-person screening sessions featuring a selection of shorts,
			including Q&amp;As, debates, discussions, and more.
		</p>

		<h2 class=" text-xl font-semibold text-zinc-100">What does this entail?</h2>
		<p class="">
			Our curatorial team handles pre-screening, categorizing, and note-taking for all submissions
			(hopefully, there will be many!). That’s Curation Phase 1. As a jury member, you are welcome
			to participate in this phase if you wish, but it’s not mandatory.
		</p>
		<p class="">
			<span class="font-semibold">Curation Phase 2:</span> This is when your presence is needed. In two
			events, with the support of the curators, we’ll watch and discuss the submissions together. As
			a jury member, you’ll help make the final selection for the screenings. You are also invited to
			moderate the screening session of your curated selection, if you wish.
		</p>

		<h2 class=" text-xl font-semibold text-zinc-100">Timeline and Key Dates</h2>
		<ul class=" list-disc pl-5">
			<li>Open Call: <span class="font-medium">12 Dec 2025 – 10 Jan 2026</span></li>
			<li>
				Curation Phase 1 (Individual Viewing): <span class="font-medium">19 Jan – 31 Jan</span>
			</li>
			<li class="text-green-600">
				Curation Phase 2 (Collective Curation): <span class="font-medium">1 Feb – 15 Feb</span>
				<ul class="list-disc pl-5">
					<li>2 events, dates to be decided with jury members</li>
				</ul>
			</li>
			<li>Physical Meetings at Kanapé: <span class="font-medium">6 &amp; 13 Feb</span></li>
			<li>Preparation of Space and Events: <span class="font-medium">16 Feb – 27 Feb</span></li>
			<li>Festival: <span class="font-medium">27 Feb – 15 Mar</span></li>
			<li>Festival Opening and First Screening: <span class="font-medium">27 Feb</span></li>
			<li>Festival Second Screening Session: <span class="font-medium">6 Mar</span></li>
			<li>Festival Closing and Last Screening: <span class="font-medium">13 Mar</span></li>
		</ul>

		<h2 class=" text-xl font-semibold text-zinc-100">Is this paid?</h2>
		<p class="">
			Not this year. We are all doing this as volunteers while we look for funding and sponsors, but
			we are not counting on it. <span class="text-lg">🤷</span> Maybe next year!
		</p>

		<h2 class=" text-xl font-semibold text-zinc-100">Next Step</h2>
		<p class="mb-6">
			Please confirm your participation, or feel free to ask any questions, with the person who sent
			you this link. Thank you so much for your help &mdash; we’re excited to make this festival
			happen together!
		</p>

		<ul class="text-zinc-100">
			<li>Célestin Meunier</li>
			<li>Manus Nijhoff</li>
			<li>Sena Dogan</li>
			<li>Lilli Grube</li>
			<li>Su Durakbaşa</li>
		</ul>
	</div>
</div>

<style>
	p,
	li {
		color: var (--zinc-400);
	}
	h1,
	h2 {
		color: var (--zinc-100);
	}
	a {
		color: var (--zinc-100);
		text-decoration: underline;
	}
</style>
