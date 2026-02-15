import { error } from '@sveltejs/kit';
import { getDocument, groqQueries, slugify } from '$lib/sanity';

type SelectionEntry = {
	selectionMethod: 'highlight' | 'score';
	film: {
		_id: string;
		englishTitle: string;
		directorName: string;
	};
};

type TvSelection = {
	films: SelectionEntry[] | null;
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
	castAndCrew: string | null;
	thanks: string | null;
	previousScreenings: boolean;
	previousScreeningLocations: string | null;
	poster: { asset: { _id: string; url: string } } | null;
	screenshots: Array<{ asset: { _id: string; url: string } }> | null;
};

export async function load({ params }) {
	const selection = await getDocument<TvSelection>(groqQueries.tvSelection);
	const entries = selection?.films ?? [];

	const slugCounts = new Map<string, number>();
	let matchedId: string | null = null;
	let matchedMethod: 'highlight' | 'score' = 'score';

	for (const entry of entries) {
		if (!entry.film) continue;
		let slug = slugify(entry.film.englishTitle);
		const count = slugCounts.get(slug) ?? 0;
		slugCounts.set(slug, count + 1);
		if (count > 0) {
			slug = `${slug}-${slugify(entry.film.directorName)}`;
		}
		if (slug === params.slug) {
			matchedId = entry.film._id;
			matchedMethod = entry.selectionMethod;
		}
	}

	if (!matchedId) {
		error(404, 'Film not found');
	}

	const film = await getDocument<FilmDetail>(groqQueries.filmDetail, { id: matchedId });

	if (!film) {
		error(404, 'Film not found');
	}

	return { film, isHighlight: matchedMethod === 'highlight' };
}
