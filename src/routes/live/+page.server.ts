import { dev } from '$app/environment';
import { getDocument, groqQueries } from '$lib/sanity';

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

type FilmDetails = {
	_id: string;
	synopsis: string | null;
	website: string | null;
	castAndCrew: string | null;
	thanks: string | null;
	screenshots: Array<{ asset: { _id: string; url: string; metadata: unknown } }> | null;
};

export async function load({ url }) {
	const useTest = dev && url.searchParams.get('source') !== 'production';
	const schedule = await getDocument<PlaybackSchedule>(groqQueries.playbackSchedule(useTest));
	const entries = (schedule?.entries ?? []).filter((e) => e.film);

	// Collect unique film IDs
	const filmIds = [...new Set(entries.map((e) => e.film!._id))];

	// Fetch enriched film details (synopsis, website, etc.)
	const films = await getDocument<FilmDetails[]>(
		`*[_type == "submission" && _id in $ids]{
			_id, synopsis, website, castAndCrew, thanks,
			"screenshots": screenshots[]{ asset->{ _id, url, metadata } }
		}`,
		{ ids: filmIds }
	);

	const filmDetailsMap: Record<string, FilmDetails> = {};
	for (const f of films ?? []) {
		filmDetailsMap[f._id] = f;
	}

	return { entries, filmDetailsMap, dev, source: useTest ? 'test' : 'production' };
}
