import { dev } from '$app/environment';
import { getDocument, groqQueries, slugify } from '$lib/sanity';

type ScheduleEntry = {
	startTime: string;
	endTime: string;
	durationSeconds: number;
	film: {
		_id: string;
		englishTitle: string;
		originalTitle: string;
		directorName: string;
		length: number;
		categories: string[];
		poster: { asset: { _id: string; url: string; metadata: unknown } } | null;
		screenshot: { asset: { _id: string; url: string; metadata: unknown } } | null;
	} | null;
};

type PlaybackSchedule = {
	entries: ScheduleEntry[] | null;
};

type SocialLink = {
	_key: string;
	platform: string;
	url: string;
	label: string;
};

type FilmDetails = {
	_id: string;
	synopsisPlain: string | null;
	website: SocialLink[] | null;
	socialMedia: SocialLink[] | null;
	castAndCrewPlain: string | null;
	thanksPlain: string | null;
};

type GraphContext = {
	metaCategories: Array<{ _id: string; name: string; filmIds: string[] }>;
	clusters: Array<{ _id: string; name: string; allFilmIds: string[] }>;
	screenings: Array<{ _id: string; name: string; filmIds: string[] }>;
};

type MiniGraphData = {
	currentFilmId: string;
	currentFilmSlug: string;
	metaCategories: Array<{ _id: string; name: string; filmIds: string[] }>;
	clusters: Array<{ _id: string; name: string; filmIds: string[] }>;
	screenings: Array<{ _id: string; name: string; filmIds: string[] }>;
	neighborFilms: Array<{ _id: string; englishTitle: string; length: number; slug: string }>;
};

export async function load({ url }) {
	const useTest = dev && url.searchParams.get('source') !== 'production';
	const schedule = await getDocument<PlaybackSchedule>(groqQueries.playbackSchedule(useTest));
	const entries = (schedule?.entries ?? []).filter((e) => e.film);

	// Collect unique film IDs
	const filmIds = [...new Set(entries.map((e) => e.film!._id))];

	// Build slug map for all films (needed for miniGraph neighbor links)
	const idToSlug = new Map<string, string>();
	const slugCounts = new Map<string, number>();
	for (const entry of entries) {
		if (!entry.film || idToSlug.has(entry.film._id)) continue;
		let slug = slugify(entry.film.englishTitle);
		const count = slugCounts.get(slug) ?? 0;
		slugCounts.set(slug, count + 1);
		if (count > 0) slug = `${slug}-${slugify(entry.film.directorName)}`;
		idToSlug.set(entry.film._id, slug);
	}

	// Fetch enriched film details and graph contexts in parallel
	const [films, graphContexts] = await Promise.all([
		getDocument<FilmDetails[]>(
			`*[_type == "submission" && _id in $ids]{
				_id,
				"synopsisPlain": pt::text(synopsis),
				website[]{ _key, platform, url, label },
				socialMedia[]{ _key, platform, url, label },
				"castAndCrewPlain": pt::text(castAndCrew),
				"thanksPlain": pt::text(thanks)
			}`,
			{ ids: filmIds }
		),
		getDocument<GraphContext[]>(
			`*[_type == "submission" && _id in $ids]{
				"metaCategories": *[_type == "metaCategory" && ^._id in films[].film._ref]{
					_id, name, "filmIds": films[].film._ref
				},
				"clusters": *[_type == "semanticCluster" && (^._id in highlightedFilms[]._ref || ^._id in relevantFilms[]._ref)]{
					_id, name, "allFilmIds": [...highlightedFilms[]._ref, ...relevantFilms[]._ref]
				},
				"screenings": *[_type == "screening" && ^._id in films[]._ref]{
					_id, "name": title, "filmIds": films[]._ref
				}
			}`,
			{ ids: filmIds }
		)
	]);

	const filmDetailsMap: Record<string, FilmDetails> = {};
	for (const f of films ?? []) {
		filmDetailsMap[f._id] = f;
	}

	// Build miniGraph data per film
	const selectedFilmIds = new Set(filmIds);
	const miniGraphMap: Record<string, MiniGraphData> = {};
	const allNeighborIds = new Set<string>();

	for (let i = 0; i < filmIds.length; i++) {
		const filmId = filmIds[i];
		const gc = graphContexts?.[i];
		if (!gc) continue;

		const metaCategories = (gc.metaCategories ?? [])
			.map((mc) => ({
				_id: mc._id,
				name: mc.name,
				filmIds: (mc.filmIds ?? []).filter((id) => selectedFilmIds.has(id))
			}))
			.filter((mc) => mc.filmIds.length > 0);

		const clusters = (gc.clusters ?? [])
			.map((c) => ({
				_id: c._id,
				name: c.name,
				filmIds: [...new Set((c.allFilmIds ?? []).filter((id) => selectedFilmIds.has(id)))]
			}))
			.filter((c) => c.filmIds.length > 0);

		const graphScreenings = (gc.screenings ?? [])
			.map((s) => ({
				_id: s._id,
				name: s.name,
				filmIds: (s.filmIds ?? []).filter((id) => selectedFilmIds.has(id))
			}))
			.filter((s) => s.filmIds.length > 0);

		for (const mc of metaCategories)
			for (const id of mc.filmIds) if (id !== filmId) allNeighborIds.add(id);
		for (const c of clusters)
			for (const id of c.filmIds) if (id !== filmId) allNeighborIds.add(id);
		for (const s of graphScreenings)
			for (const id of s.filmIds) if (id !== filmId) allNeighborIds.add(id);

		miniGraphMap[filmId] = {
			currentFilmId: filmId,
			currentFilmSlug: idToSlug.get(filmId) ?? filmId,
			metaCategories,
			clusters,
			screenings: graphScreenings,
			neighborFilms: []
		};
	}

	// Fetch neighbor film details in one batch
	if (allNeighborIds.size > 0) {
		const rawNeighbors = await getDocument<
			Array<{ _id: string; englishTitle: string; length: number }>
		>(`*[_type == "submission" && _id in $ids]{ _id, englishTitle, length }`, {
			ids: [...allNeighborIds]
		});

		const neighborMap = new Map<
			string,
			{ _id: string; englishTitle: string; length: number; slug: string }
		>();
		for (const f of rawNeighbors ?? []) {
			neighborMap.set(f._id, {
				_id: f._id,
				englishTitle: f.englishTitle || 'Untitled',
				length: f.length || 0,
				slug: idToSlug.get(f._id) || f._id
			});
		}

		for (const filmId of filmIds) {
			const mg = miniGraphMap[filmId];
			if (!mg) continue;
			const nIds = new Set<string>();
			for (const mc of mg.metaCategories)
				for (const id of mc.filmIds) if (id !== filmId) nIds.add(id);
			for (const c of mg.clusters)
				for (const id of c.filmIds) if (id !== filmId) nIds.add(id);
			for (const s of mg.screenings)
				for (const id of s.filmIds) if (id !== filmId) nIds.add(id);
			mg.neighborFilms = [...nIds]
				.map((id) => neighborMap.get(id))
				.filter((n): n is NonNullable<typeof n> => !!n);
		}
	}

	return { entries, filmDetailsMap, miniGraphMap, dev, source: useTest ? 'test' : 'production' };
}
