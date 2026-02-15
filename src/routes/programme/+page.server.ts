import { getDocument, groqQueries, slugify } from '$lib/sanity';

type FilmSummary = {
	_id: string;
	englishTitle: string;
	originalTitle: string;
	directorName: string;
	yearOfCompletion: number;
	length: number;
	categories: string[];
	poster: { asset: { _id: string; url: string } } | null;
	screenshot: { asset: { _id: string; url: string } } | null;
};

type SelectionEntry = {
	selectionMethod: 'highlight' | 'score';
	film: FilmSummary;
};

type TvSelection = {
	films: SelectionEntry[] | null;
};

function addSlugs(films: FilmSummary[]) {
	const slugCounts = new Map<string, number>();
	return films.map((film) => {
		let slug = slugify(film.englishTitle);
		const count = slugCounts.get(slug) ?? 0;
		slugCounts.set(slug, count + 1);
		if (count > 0) {
			slug = `${slug}-${slugify(film.directorName)}`;
		}
		return { ...film, slug };
	});
}

export async function load() {
	const data = await getDocument<TvSelection>(groqQueries.tvSelection);
	const entries = data?.films ?? [];

	const highlightFilms: FilmSummary[] = [];
	const selectionFilms: FilmSummary[] = [];

	for (const entry of entries) {
		if (!entry.film) continue;
		if (entry.selectionMethod === 'highlight') {
			highlightFilms.push(entry.film);
		} else {
			selectionFilms.push(entry.film);
		}
	}

	return {
		highlights: addSlugs(highlightFilms),
		films: addSlugs(selectionFilms)
	};
}
