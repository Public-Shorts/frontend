<script lang="ts">
	import RichText from '$lib/components/RichText.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();

	const s = $derived(data.festivalSettings);
	const totalHours = $derived(Math.floor(data.selectionStats.totalMinutes / 60));
	const remainingMinutes = $derived(data.selectionStats.totalMinutes % 60);

	function formatDateRange(start: string | null, end: string | null): string {
		if (!start) return '';
		const startDate = new Date(start);
		const endDate = end ? new Date(end) : null;
		const fmt = (d: Date) =>
			d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
		return endDate ? `${fmt(startDate)} – ${fmt(endDate)}` : fmt(startDate);
	}

	function formatScreeningDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function printPage() {
		const allLoaded = [...document.images].every((img) => img.complete);
		if (allLoaded) {
			window.print();
		} else {
			Promise.all(
				[...document.images].map(
					(img) =>
						new Promise<void>((resolve) => {
							if (img.complete) resolve();
							else {
								img.onload = () => resolve();
								img.onerror = () => resolve();
							}
						})
				)
			).then(() => window.print());
		}
	}
</script>

<SEO title="Press Kit – Public Shorts" />

<svelte:head>
	<style>
		@media print {
			@page {
				size: A4 portrait;
				margin: 15mm;
			}
			nav {
				display: none !important;
			}
			footer {
				display: none !important;
			}
			main {
				background: white !important;
				min-height: auto !important;
			}
		}
	</style>
</svelte:head>

<!-- Action bar (hidden in print) -->
<div class="action-bar no-print">
	<a href="/press" class="back-link">&larr; Back to Press</a>
	<button onclick={printPage} class="print-btn">Save as PDF</button>
</div>

<!-- Press Kit Document -->
<article class="press-kit">
	<!-- Header -->
	<header class="kit-header">
		<img src="/images/logo/publicshorts-logo.svg" alt="Public Shorts" class="kit-logo" />
		<p class="kit-tagline">24/7 Video Festival in Berlin</p>
		{#if s?.festivalYear}
			<p class="kit-year">{s.festivalYear} Edition</p>
		{/if}
		<p class="kit-date">
			{formatDateRange(s?.festivalStartDate ?? null, s?.festivalEndDate ?? null)}
		</p>
		{#if s?.location}
			<p class="kit-location">{s.location}</p>
		{/if}
	</header>

	<hr class="divider" />

	<!-- Concept -->
	<section class="kit-section">
		<h2 class="section-title">Concept</h2>
		<p class="section-body">
			Public Shorts is an experimental – 24/7 video festival – taking place in Berlin from February
			27 to March 15, 2026. From the wide and inclusive open-call, through the collective curation
			process, and all the way to the public viewing display, Public Shorts aims to rethink what
			public art can be.
		</p>
	</section>

	<!-- Window Photos -->
	<div class="overview-photos">
		<img
			src="/images/Pictures/window/window-pics-02.png"
			alt="Window at Kanapé with CRT-TV"
			class="overview-photo"
			loading="eager"
		/>
		<img
			src="/images/Pictures/window/window-pics-01.png"
			alt="Window at Kanapé with CRT-TV"
			class="overview-photo"
			loading="eager"
		/>
		<img
			src="/images/Pictures/window/window-pics-03.png"
			alt="Window at Kanapé with CRT-TV"
			class="overview-photo"
			loading="eager"
		/>
		<img
			src="/images/Pictures/window/window-pics-04.png"
			alt="Window at Kanapé with CRT-TV"
			class="overview-photo"
			loading="eager"
		/>
	</div>

	<!-- 24/7 Program -->
	<section class="kit-section">
		<h2 class="section-title">24/7 Program</h2>
		<p class="section-body">
			Throughout the festival, the curated selection plays on loop on screens visible through the
			glass windows at Hobrechstraße 54, 12047 Berlin, accessible to anyone passing by at any time
			of day or night. The public is also invited to engage with the festival as an active
			participant, and review the videos.
		</p>
	</section>

	<!-- Selection -->
	{#if data.selectionStats.totalFilms > 0}
		<section class="kit-section">
			<h2 class="section-title">Selection</h2>
			<p class="section-body">
				From over 400 open-call submissions, our curatorial team collectively selected
				{data.selectionStats.totalFilms} short films totaling {totalHours}h{remainingMinutes}m of programming,
				with an average runtime of ~{data.selectionStats.avgMinutes} minutes per film. The selection spans
				{data.selectionStats.topCategories.slice(0, 5).join(', ').toLowerCase()}, and more.
			</p>
		</section>
	{/if}

	<!-- Programme Highlights -->
	{#if data.topFilms.length > 0}
		<section class="kit-section page-break-before">
			<h2 class="section-title">Programme Highlights</h2>
			<div class="films-grid">
				{#each data.topFilms as film (film._id)}
					<div class="film-card">
						{#if film.screenshotUrl}
							<img
								src={film.screenshotUrl}
								alt={film.englishTitle}
								class="film-screenshot"
								loading="eager"
							/>
						{/if}
						<div class="film-info">
							<strong class="film-title">{film.englishTitle}</strong>
							<span class="film-director">{film.directorName}</span>
							{#if film.length}
								<span class="film-length">{film.length} min</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Screening Events -->
	{#if data.screenings.length > 0}
		<section class="kit-section page-break-before">
			<h2 class="section-title">Events</h2>
			<p class="section-body">
				In addition to the continuous display in the window, special in-person events feature
				Q&amp;As, debates, and discussions:
			</p>
			<div class="screenings-list">
				{#each data.screenings as screening (screening._id)}
					<div class="screening-row">
						<div class="screening-meta">
							<strong class="screening-title">{screening.title}</strong>
							<span class="screening-date">{formatScreeningDate(screening.date)}</span>
							<span class="screening-location">{screening.location}</span>
							{#if screening.language || screening.duration}
								<span class="screening-details">
									{#if screening.language}{screening.language}{/if}{#if screening.language && screening.duration} · {/if}{#if screening.duration}{screening.duration}{/if}
								</span>
							{/if}
						</div>
						{#if screening.description && screening.description.length > 0}
							<RichText blocks={screening.description} class="screening-desc" />
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Open Call -->
	<section class="kit-section">
		<h2 class="section-title">Open Call</h2>
		<p class="section-body">
			All types of video media under 15 minutes, made in the past 3 years are welcome. The festival
			is curated by a diverse team of curators who collectively shape the selection.
		</p>
	</section>

	<!-- Team -->
	<section class="kit-section">
		<h2 class="section-title">Team</h2>
		<p class="section-body">
			Célestin Meunier, Manus Nijhoff, Sena Doğan, Lilli Grube, and Su Durakbaşa.
		</p>
	</section>

	<!-- Curatorial Team -->
	{#if data.curators.length > 0}
		<section class="kit-section">
			<h2 class="section-title">Curatorial Team</h2>
			<p class="section-body">
				{data.curators.map((c) => c.name).join(', ')}.
			</p>
		</section>
	{/if}

	<!-- Meta Jury -->
	<section class="kit-section">
		<h2 class="section-title">Meta Jury</h2>
		<p class="section-body">
			Jamie Allen, Luce Delire, Nina Fischer, Rachel Uwa, and Florian Wüst.
		</p>
	</section>

	<!-- Thanks -->
	<section class="kit-section">
		<h2 class="section-title">Thanks</h2>
		<p class="section-body">
			Thanks to Kanapé for hosting and the technical support, and to all our partners and
			supporters, and to all the artists submitting their works. Thank you to Bruno Goal for his
			technical support. Special thanks to Florian Wüst for his support and advising throughout the
			whole process.
		</p>
	</section>

	<!-- Partners -->
	{#if data.partners.length > 0}
		<section class="kit-section">
			<h2 class="section-title">Partners</h2>
			<div class="partners-grid">
				{#each data.partners as partner (partner._key)}
					<div class="partner-item">
						{#if partner.logoUrl}
							<img
								src={partner.logoUrl}
								alt="{partner.name} logo"
								class="partner-logo"
								loading="eager"
							/>
						{:else}
							<span class="partner-name">{partner.name}</span>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Press Assets -->
	<section class="kit-section">
		<h2 class="section-title">Press Assets</h2>
		<p class="section-body">
			Logos, photos, and other press materials are available for download at:<br />
			<a href="https://drive.google.com/drive/folders/1PPWsrNC9_jV8-v63BC3NUzM5f9qpfCIa?usp=sharing">
				drive.google.com/drive/folders/1PPWsrNC9_jV8-v63BC3NUzM5f9qpfCIa
			</a>
		</p>
	</section>

	<!-- Contact -->
	<section class="kit-section">
		<h2 class="section-title">Contact</h2>
		{#if s?.contactEmail}
			<p class="section-body">
				For press inquiries: <a href="mailto:{s.contactEmail}">{s.contactEmail}</a>
				— please mention "press" in the subject.
			</p>
		{/if}
		{#if s?.socialMedia?.instagram}
			<p class="section-body">
				Instagram: <a href={s.socialMedia.instagram}>{s.socialMedia.instagram}</a>
			</p>
		{/if}
		<p class="section-body">
			Website: <a href="https://publicshorts.org">publicshorts.org</a>
		</p>
	</section>

	<!-- Donation -->
	<section class="kit-section">
		<h2 class="section-title">Donation</h2>
		<p class="section-body">
			Donations help support the festival and its activities. You can donate via PayPal at
			paypal.me/publicshorts.
		</p>
	</section>

	<footer class="kit-footer">
		<span>Public Shorts {s?.festivalYear ?? ''} — publicshorts.org</span>
	</footer>
</article>

<style>
	/* ---- Action bar ---- */
	.action-bar {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 24px;
		background: #f9f7f5;
		border-bottom: 1px solid #e6e0db;
		font-size: 0.875rem;
	}
	.back-link {
		color: #635e59;
		text-decoration: none;
	}
	.back-link:hover {
		color: #1c1917;
	}
	.print-btn {
		padding: 8px 20px;
		background: #1c1917;
		color: white;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
		font-family: inherit;
	}
	.print-btn:hover {
		background: #ff7411;
	}

	/* ---- Document ---- */
	.press-kit {
		max-width: 210mm;
		margin: 0 auto;
		padding: 32px 24px 48px;
		background: white;
		color: #1c1917;
	}

	/* ---- Header ---- */
	.kit-header {
		margin-bottom: 2rem;
	}
	.kit-logo {
		height: 48px;
		width: auto;
		display: block;
		margin-bottom: 1rem;
		filter: invert(1);
	}
	.kit-tagline {
		font-size: 1.125rem;
		color: #635e59;
		margin: 0;
	}
	.kit-year {
		font-size: 0.875rem;
		color: #857f7a;
		margin: 0;
	}
	.kit-date {
		font-size: 1rem;
		font-weight: 600;
		margin-top: 0.5rem;
	}
	.kit-location {
		font-size: 0.875rem;
		color: #635e59;
	}
	.divider {
		border: none;
		border-top: 1px solid #e6e0db;
		margin: 1.5rem 0;
	}

	/* ---- Sections ---- */
	.kit-section {
		margin-bottom: 2.5rem;
	}
	.section-title {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #857f7a;
		margin: 0 0 0.75rem;
		font-weight: 600;
	}
	.section-body {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: #45413d;
	}
	.section-body a {
		color: #1c1917;
	}

	/* ---- Overview photos ---- */
	.overview-photos {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		margin-bottom: 2.5rem;
	}
	.overview-photo {
		width: 100%;
		height: auto;
		display: block;
	}

	/* ---- Films grid ---- */
	.films-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	.film-card {
		break-inside: avoid;
	}
	.film-screenshot {
		width: 100%;
		aspect-ratio: 16/9;
		object-fit: cover;
		display: block;
		background: #e6e0db;
	}
	.film-info {
		padding: 6px 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.film-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #1c1917;
	}
	.film-director {
		font-size: 0.75rem;
		color: #635e59;
	}
	.film-length {
		font-size: 0.75rem;
		color: #857f7a;
	}

	/* ---- Screenings ---- */
	.screenings-list {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin-top: 1rem;
	}
	.screening-row {
		border-left: 2px solid #45413d;
		padding-left: 1rem;
		break-inside: avoid;
	}
	.screening-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.screening-title {
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.screening-date,
	.screening-location {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #857f7a;
	}
	.screening-details {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #857f7a;
	}
	.screening-desc {
		font-size: 0.875rem;
		color: #635e59;
		margin-top: 0.5rem;
		line-height: 1.5;
	}
	.screening-desc :global(p) {
		margin: 0.25rem 0;
	}
	.screening-desc :global(h3) {
		font-size: 0.875rem;
		font-weight: 600;
		color: #45413d;
		margin: 0.5rem 0 0.125rem;
	}
	.screening-desc :global(a) {
		color: #1c1917;
		text-decoration: underline;
	}

	/* ---- Partners ---- */
	.partners-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: center;
	}
	.partner-logo {
		height: 40px;
		width: auto;
		object-fit: contain;
		filter: grayscale(1);
	}
	.partner-name {
		font-size: 0.875rem;
		color: #635e59;
	}

	/* ---- Footer ---- */
	.kit-footer {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid #e6e0db;
		font-size: 0.75rem;
		color: #a8a29d;
		text-align: center;
	}

	/* ---- Print ---- */
	@media print {
		.no-print {
			display: none !important;
		}
		.press-kit {
			padding: 0;
			max-width: 100%;
			margin: 0;
		}
		.page-break-before {
			page-break-before: always;
			break-before: page;
		}
		.film-card,
		.screening-row {
			break-inside: avoid;
		}
		img {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
		a {
			color: inherit;
			text-decoration: none;
		}
	}
</style>
