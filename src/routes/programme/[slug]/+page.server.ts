import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getDocument, groqQueries, slugify } from '$lib/sanity';
import type { EntryGenerator } from './$types';

type SelectionEntry = {
	selectionMethod: 'highlight' | 'score' | 'screening';
	film: {
		_id: string;
		englishTitle: string;
		directorName: string;
	};
};

type TvSelection = {
	films: SelectionEntry[] | null;
};

export const entries: EntryGenerator = async () => {
	const selection = await getDocument<TvSelection>(groqQueries.tvSelection);
	const films = selection?.films ?? [];
	const slugCounts = new Map<string, number>();
	const slugs: Array<{ slug: string }> = [];
	for (const entry of films) {
		if (!entry.film) continue;
		let slug = slugify(entry.film.englishTitle);
		const count = slugCounts.get(slug) ?? 0;
		slugCounts.set(slug, count + 1);
		if (count > 0) slug = `${slug}-${slugify(entry.film.directorName)}`;
		slugs.push({ slug });
	}
	return slugs;
};

type FilmDetail = {
	_id: string;
	englishTitle: string;
	originalTitle: string;
	directorName: string;
	yearOfCompletion: number;
	length: number;
	filmLanguage: string[];
	synopsis: string;
	categories: string[];
	categoryOther: string | null;
	website: string | null;
	explicit: boolean;
	explicitDetails: string | null;
	adult: boolean;
	castAndCrew: string | null;
	thanks: string | null;
	previousScreenings: boolean;
	previousScreeningLocations: string | null;
	poster: { asset: { _id: string; url: string } } | null;
	screenshots: Array<{ asset: { _id: string; url: string } }> | null;
};

type GraphContext = {
	metaCategories: Array<{
		_id: string;
		name: string;
		filmIds: string[];
	}>;
	clusters: Array<{
		_id: string;
		name: string;
		allFilmIds: string[];
	}>;
	screenings: Array<{
		_id: string;
		name: string;
		filmIds: string[];
	}>;
};

type ScheduleEntry = {
	startTime: string;
	endTime: string;
	durationSeconds: number;
	film: {
		_id: string;
		englishTitle: string;
	} | null;
};

type PlaybackSchedule = {
	entries: ScheduleEntry[] | null;
};

export async function load({ params, url }) {
	const selection = await getDocument<TvSelection>(groqQueries.tvSelection);
	const entries = selection?.films ?? [];

	const slugCounts = new Map<string, number>();
	let matchedId: string | null = null;

	// Build slug map for all selected films (needed for neighbor slug computation)
	const idToSlug = new Map<string, string>();

	for (const entry of entries) {
		if (!entry.film) continue;
		let slug = slugify(entry.film.englishTitle);
		const count = slugCounts.get(slug) ?? 0;
		slugCounts.set(slug, count + 1);
		if (count > 0) {
			slug = `${slug}-${slugify(entry.film.directorName)}`;
		}
		idToSlug.set(entry.film._id, slug);
		if (slug === params.slug) {
			matchedId = entry.film._id;
		}
	}

	if (!matchedId) {
		error(404, 'Film not found');
	}

	const selectedFilmIds = new Set(entries.filter((e) => e.film).map((e) => e.film._id));

	const useTest = dev && url.searchParams.get('source') !== 'production';

	const [film, graphContext, schedule] = await Promise.all([
		getDocument<FilmDetail>(groqQueries.filmDetail, { id: matchedId }),
		getDocument<GraphContext>(groqQueries.filmGraphContext, { id: matchedId }),
		getDocument<PlaybackSchedule>(groqQueries.playbackSchedule(useTest)),
	]);

	if (!film) {
		error(404, 'Film not found');
	}

	// Process graph context: filter to selected films only
	const metaCategories = (graphContext?.metaCategories ?? [])
		.map((mc) => ({
			_id: mc._id,
			name: mc.name,
			filmIds: (mc.filmIds ?? []).filter((id) => selectedFilmIds.has(id)),
		}))
		.filter((mc) => mc.filmIds.length > 0);

	const clusters = (graphContext?.clusters ?? [])
		.map((c) => ({
			_id: c._id,
			name: c.name,
			filmIds: [...new Set((c.allFilmIds ?? []).filter((id) => selectedFilmIds.has(id)))],
		}))
		.filter((c) => c.filmIds.length > 0);

	const graphScreenings = (graphContext?.screenings ?? [])
		.map((s) => ({
			_id: s._id,
			name: s.name,
			filmIds: (s.filmIds ?? []).filter((id) => selectedFilmIds.has(id)),
		}))
		.filter((s) => s.filmIds.length > 0);

	// Collect neighbor film IDs
	const neighborIdSet = new Set<string>();
	for (const mc of metaCategories) {
		for (const id of mc.filmIds) {
			if (id !== matchedId) neighborIdSet.add(id);
		}
	}
	for (const c of clusters) {
		for (const id of c.filmIds) {
			if (id !== matchedId) neighborIdSet.add(id);
		}
	}
	for (const s of graphScreenings) {
		for (const id of s.filmIds) {
			if (id !== matchedId) neighborIdSet.add(id);
		}
	}

	// Fetch minimal neighbor film data
	let neighborFilms: Array<{
		_id: string;
		englishTitle: string;
		length: number;
		slug: string;
	}> = [];

	if (neighborIdSet.size > 0) {
		const ids = [...neighborIdSet];
		const rawNeighbors = await getDocument<
			Array<{ _id: string; englishTitle: string; length: number }>
		>(`*[_type == "submission" && _id in $ids]{ _id, englishTitle, length }`, { ids });

		neighborFilms = (rawNeighbors ?? []).map((f) => ({
			_id: f._id,
			englishTitle: f.englishTitle || 'Untitled',
			length: f.length || 0,
			slug: idToSlug.get(f._id) || f._id,
		}));
	}

	const screenings = (schedule?.entries ?? [])
		.filter((e) => e.film && e.film._id === matchedId)
		.map((e) => ({ startTime: e.startTime, durationSeconds: e.durationSeconds }));

	return {
		film,
		screenings,
		dev,
		source: useTest ? 'test' : 'production',
		miniGraph: {
			currentFilmId: matchedId,
			currentFilmSlug: params.slug,
			metaCategories,
			clusters,
			screenings: graphScreenings,
			neighborFilms,
		},
	};
}
