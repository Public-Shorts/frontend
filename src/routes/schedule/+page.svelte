<script lang="ts">
	import GridLayout from '$lib/components/GridLayout.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();

	type Entry = (typeof data.entries)[number];

	function formatTime(iso: string): string {
		const date = new Date(iso.includes('+') ? iso : iso + '+01:00');
		return date.toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Europe/Berlin',
			hour12: false,
		});
	}

	function formatDay(iso: string): string {
		const date = new Date(iso.includes('+') ? iso : iso + '+01:00');
		return date.toLocaleDateString('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			timeZone: 'Europe/Berlin',
		});
	}

	function getBerlinDay(iso: string): string {
		const date = new Date(iso.includes('+') ? iso : iso + '+01:00');
		return date.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
	}

	function formatDuration(seconds: number): string {
		const m = Math.round(seconds / 60);
		return `${m} min`;
	}

	const groupedByDay = $derived(() => {
		const groups: { day: string; dayLabel: string; entries: Entry[] }[] = [];
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
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Schedule</h1>

	{#if data.entries.length > 0}
		<div class="md:col-span-5 md:col-start-2">
			<p class="mb-8 text-gallery-600">
				{data.entries.length} films scheduled for continuous screening.
			</p>

			{#each groupedByDay() as group (group.day)}
				<div class="mb-10">
					<h2 class="mb-4 text-xl font-semibold text-gallery-800">{group.dayLabel}</h2>
					<div class="divide-y divide-gallery-200">
						{#each group.entries as entry}
							{#if entry.film}
								<div class="flex items-baseline gap-4 py-3">
									<span class="w-14 shrink-0 font-mono text-sm text-gallery-500">
										{formatTime(entry.startTime)}
									</span>
									<div class="min-w-0 flex-1">
										<span class="font-medium text-gallery-800">
											{entry.film.englishTitle}
										</span>
										<span class="ml-2 text-sm text-gallery-500">
											{entry.film.directorName}
										</span>
										{#if entry.durationSeconds}
											<span class="ml-2 text-sm text-gallery-400">
												{formatDuration(entry.durationSeconds)}
											</span>
										{/if}
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="md:col-span-3 md:col-start-2">
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
	{/if}
</GridLayout>
