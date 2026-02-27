<script lang="ts">
	import { urlFor, slugify } from '$lib/sanity';
	import ClapButton from './ClapButton.svelte';
	import CommentButton from './CommentButton.svelte';

	type FilmEntry = {
		film: {
			_id: string;
			englishTitle: string;
			originalTitle?: string;
			directorName: string;
			length: number;
			poster?: { asset: { _id: string; url: string; metadata: unknown } } | null;
			screenshot?: { asset: { _id: string; url: string; metadata: unknown } } | null;
		} | null;
		startTime: string;
		endTime: string;
		durationSeconds: number;
	};

	type Props = {
		currentEntry: FilmEntry | null;
		previousEntry: FilmEntry | null;
		clapCounts: Record<string, number>;
		compact?: boolean;
	};

	let { currentEntry, previousEntry, clapCounts, compact = false }: Props = $props();

	function imageUrl(film: NonNullable<FilmEntry['film']>): string | null {
		if (film.poster) return urlFor(film.poster).width(400).height(533).fit('crop').url();
		if (film.screenshot) return urlFor(film.screenshot).width(400).height(225).fit('crop').url();
		return null;
	}
</script>

<div class="flex flex-col gap-4">
	{#if currentEntry?.film}
		{@const film = currentEntry.film}
		{@const img = imageUrl(film)}
		<div class="flex gap-4">
			{#if img && !compact}
				<img
					src={img}
					alt={film.englishTitle}
					class="h-20 w-16 shrink-0 rounded object-cover"
				/>
			{/if}
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2">
					<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
					<span class="text-xs text-gallery-500">Now Playing</span>
				</div>
				<h3 class="mt-1 truncate font-semibold">
					<a
						href="/programme/{slugify(film.englishTitle)}"
						class="transition-colors hover:text-accent-500"
					>
						{film.englishTitle}
					</a>
				</h3>
				<p class="text-sm text-gallery-500">{film.directorName} · {film.length} min</p>
				<div class="mt-1.5 flex items-center gap-1">
					<ClapButton filmId={film._id} totalClaps={clapCounts[film._id] ?? 0} />
					<CommentButton filmId={film._id} />
				</div>
			</div>
		</div>
	{/if}

	{#if previousEntry?.film}
		{@const film = previousEntry.film}
		<div class="flex gap-4 opacity-70">
			<div class="min-w-0 flex-1">
				<span class="text-xs text-gallery-400">Previous</span>
				<h4 class="mt-0.5 truncate text-sm font-medium">
					<a
						href="/programme/{slugify(film.englishTitle)}"
						class="transition-colors hover:text-accent-500"
					>
						{film.englishTitle}
					</a>
				</h4>
				<p class="text-xs text-gallery-500">{film.directorName}</p>
				<div class="mt-1 flex items-center gap-1">
					<ClapButton filmId={film._id} totalClaps={clapCounts[film._id] ?? 0} />
					<CommentButton filmId={film._id} />
				</div>
			</div>
		</div>
	{/if}

	{#if !currentEntry?.film && !previousEntry?.film}
		<p class="text-sm text-gallery-500">No films playing right now.</p>
	{/if}
</div>
