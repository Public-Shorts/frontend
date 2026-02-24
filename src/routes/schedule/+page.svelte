<script lang="ts">
	import { onMount } from 'svelte';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { slugify } from '$lib/sanity';

	let { data } = $props();

	type Entry = (typeof data.entries)[number];

	let now = $state(Date.now());

	onMount(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 60_000);

		// Scroll to now-playing after first paint
		requestAnimationFrame(() => {
			document
				.querySelector('[data-now-playing]')
				?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		});

		return () => clearInterval(interval);
	});

	function parseIso(iso: string): Date {
		let s = iso;
		if (!s.includes('+') && !s.includes('Z')) {
			s += '+01:00';
		}
		s = s.replace(/([+-])(\d)$/, '$10$2:00');
		s = s.replace(/([+-]\d{2})$/, '$1:00');
		return new Date(s);
	}

	function formatTime(iso: string): string {
		return parseIso(iso).toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Europe/Berlin',
			hour12: false,
		});
	}

	function formatDayShort(iso: string): string {
		return parseIso(iso).toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			timeZone: 'Europe/Berlin',
		});
	}

	function formatDay(iso: string): string {
		return parseIso(iso).toLocaleDateString('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			timeZone: 'Europe/Berlin',
		});
	}

	function getBerlinDay(iso: string): string {
		return parseIso(iso).toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
	}

	function entryStatus(entry: Entry): 'past' | 'playing' | 'upcoming' {
		const startMs = parseIso(entry.startTime).getTime();
		const endMs = startMs + entry.durationSeconds * 1000;
		if (now >= startMs && now < endMs) return 'playing';
		if (now >= endMs) return 'past';
		return 'upcoming';
	}

	function dayStatus(entries: Entry[]): 'past' | 'current' | 'upcoming' {
		const last = entries[entries.length - 1];
		const lastEndMs = parseIso(last.startTime).getTime() + last.durationSeconds * 1000;
		if (now >= lastEndMs) return 'past';
		const firstStartMs = parseIso(entries[0].startTime).getTime();
		if (now >= firstStartMs) return 'current';
		return 'upcoming';
	}

	function formatDuration(seconds: number): string {
		const m = Math.floor(seconds / 60);
		return `${m} min`;
	}

	const groupedByDay = $derived(() => {
		const groups: { day: string; dayLabel: string; dayLabelShort: string; entries: Entry[] }[] =
			[];
		const dayMap = new Map<string, Entry[]>();

		for (const entry of data.entries) {
			const day = getBerlinDay(entry.startTime);
			if (!dayMap.has(day)) dayMap.set(day, []);
			dayMap.get(day)!.push(entry);
		}

		for (const [day, entries] of dayMap) {
			groups.push({
				day,
				dayLabel: formatDay(entries[0].startTime),
				dayLabelShort: formatDayShort(entries[0].startTime),
				entries,
			});
		}

		return groups;
	});
</script>

<SEO
	title="Schedule"
	description="The screening schedule for Public Shorts, the 24/7 Video Festival in Berlin."
/>

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-6">Schedule</h1>

	{#if data.dev}
		<div class="md:col-span-6">
			<div class="flex items-center gap-2 text-sm">
				<span class="text-gallery-500">Source:</span>
				<a
					href="/schedule"
					class="rounded px-2 py-1 transition-colors {data.source === 'test'
						? 'bg-gallery-200 text-gallery-900'
						: 'text-gallery-500 hover:text-gallery-700'}"
				>
					Test
				</a>
				<a
					href="/schedule?source=production"
					class="rounded px-2 py-1 transition-colors {data.source === 'production'
						? 'bg-gallery-200 text-gallery-900'
						: 'text-gallery-500 hover:text-gallery-700'}"
				>
					Production
				</a>
			</div>
		</div>
	{/if}

	{#if data.entries.length > 0}
		<div class="schedule md:col-span-6">
			<!-- Mobile date nav (top, horizontal) -->
			<nav
				class="schedule-nav sticky top-0 z-20 -mx-4 border-b border-gallery-200 bg-gallery-100/95 px-4 py-3 backdrop-blur-sm md:hidden"
			>
				<div class="flex gap-1.5 overflow-x-auto">
					{#each groupedByDay() as group (group.day)}
						{@const status = dayStatus(group.entries)}
						<a
							href="#{group.day}"
							class="shrink-0 rounded-full px-3 py-1 text-sm transition-colors
								{status === 'current'
								? 'bg-gallery-900 font-medium'
								: status === 'past'
									? 'opacity-30'
									: 'text-gallery-600 hover:bg-gallery-200 hover:text-gallery-900'}"
							style:color={status === 'current' ? 'white' : undefined}
						>
							{group.dayLabelShort}
						</a>
					{/each}
				</div>
			</nav>

			<div class="md:flex md:gap-8">
				<!-- Schedule content -->
				<div class="min-w-0 flex-1">
					{#each groupedByDay() as group, i (group.day)}
						{@const dStatus = dayStatus(group.entries)}
						<section
							id={group.day}
							class="scroll-mt-14 md:scroll-mt-0 {i > 0 ? 'mt-12' : 'mt-6'}"
						>
							<div class="md:grid md:grid-cols-[11rem_1fr] md:gap-x-6">
								<div
									class="sticky top-14 md:top-0 z-10 -mx-4 self-start bg-gallery-100/95 px-4 py-2 font-semibold backdrop-blur-sm md:mx-0 md:bg-transparent md:px-0 md:py-2 md:backdrop-blur-none
										{dStatus === 'past' ? 'opacity-30' : 'text-gallery-800'}"
								>
									{group.dayLabel}
								</div>
								<div>
									{#each group.entries as entry}
										{#if entry.film}
											{@const status = entryStatus(entry)}
											<a
												data-now-playing={status === 'playing' ? '' : undefined}
												href="/programme/{slugify(entry.film.englishTitle)}"
												class="flex items-baseline gap-4 border-b border-gallery-200/50 py-2.5 transition-colors
													{status === 'past'
													? 'opacity-30'
													: status === 'playing'
														? 'text-gallery-900 font-medium'
														: 'hover:text-accent-500'}"
											>
												<span class="w-12 shrink-0 font-mono text-sm">
													{formatTime(entry.startTime)}
												</span>
												<span class="min-w-0 flex-1 truncate">
													{entry.film.englishTitle}
												</span>
												<span
													class="hidden shrink-0 text-sm tabular-nums md:inline
														{status !== 'past' ? 'text-gallery-400' : ''}"
												>
													{formatDuration(entry.durationSeconds)}
												</span>
											</a>
										{/if}
									{/each}
								</div>
							</div>
						</section>
					{/each}
				</div>

				<!-- Desktop date nav (right sidebar) -->
				<nav class="hidden shrink-0 self-start md:block sticky top-4 pt-6">
					<div class="flex flex-col gap-1.5">
						{#each groupedByDay() as group (group.day)}
							{@const status = dayStatus(group.entries)}
							<a
								href="#{group.day}"
								class="rounded-full px-3 py-1 text-sm text-right transition-colors
									{status === 'current'
									? 'bg-gallery-900 font-medium'
									: status === 'past'
										? 'opacity-30'
										: 'text-gallery-600 hover:bg-gallery-200 hover:text-gallery-900'}"
								style:color={status === 'current' ? 'white' : undefined}
							>
								{group.dayLabelShort}
							</a>
						{/each}
					</div>
				</nav>
			</div>
		</div>
	{:else}
		<div class="font-semibold md:col-span-1">Schedule</div>
		<div class="md:col-span-3">
			<p class="text-gallery-600">
				The screening schedule is not yet available. It will be published closer to the start of
				the festival.
			</p>
			<p>
				Check our <a
					href="/events"
					class="underline decoration-gallery-500 underline-offset-2 hover:text-gallery-900"
					>events page</a
				> for upcoming screenings and special events.
			</p>
		</div>
		<div class="hidden md:col-span-2 md:block"></div>
	{/if}
</GridLayout>

<style>
	.schedule a,
	.schedule-nav a {
		text-decoration: none;
	}
</style>
