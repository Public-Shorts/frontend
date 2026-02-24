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
	selectionMethod: 'highlight' | 'score' | 'screening';
	film: FilmSummary;
};

type TvSelection = {
	films: SelectionEntry[] | null;
};

export async function load() {
	const data = await getDocument<TvSelection>(groqQueries.tvSelection);
	const entries = data?.films ?? [];

	const films = entries.filter((e) => e.film).map((e) => e.film);

	const slugCounts = new Map<string, number>();
	const filmsWithSlugs = films.map((film) => {
		let slug = slugify(film.englishTitle);
		const count = slugCounts.get(slug) ?? 0;
		slugCounts.set(slug, count + 1);
		if (count > 0) {
			slug = `${slug}-${slugify(film.directorName)}`;
		}
		return { ...film, slug };
	});

	return { films: filmsWithSlugs, tvSelectionCount: entries.length };
}
