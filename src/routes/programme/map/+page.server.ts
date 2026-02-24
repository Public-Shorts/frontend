import { getDocument, slugify } from '$lib/sanity';

const query = `{
	"tvSelection": *[_type == "tvSelection"][0]{
		"filmIds": films[].film._ref
	},
	"films": *[_type == "submission"] {
		_id,
		englishTitle,
		originalTitle,
		directorName,
		yearOfCompletion,
		length,
		categories,
		country,
		filmLanguage,
		synopsis,
		"poster": poster{ asset->{ _id, url, metadata } },
		"screenshot": screenshots[0]{ asset->{ _id, url, metadata } }
	},
	"metaCategories": *[_type == "metaCategory"] | order(name asc) {
		_id,
		name,
		description,
		type,
		"filmIds": films[] {
			"filmId": film._ref,
			score
		}
	},
	"clusters": *[_type == "semanticCluster"] | order(name asc) {
		_id,
		name,
		description,
		keywords,
		"highlightedFilmIds": highlightedFilms[]._ref,
		"relevantFilmIds": relevantFilms[]._ref
	},
	"screenings": *[_type == "screening"] | order(title asc) {
		_id,
		title,
		"filmIds": films[]._ref
	}
}`;

export async function load({ url }) {
	const result = await getDocument<any>(query);

	const selectedFilmIds = new Set<string>(result.tvSelection?.filmIds || []);

	// Compute slugs with disambiguation for duplicate titles
	const slugCounts = new Map<string, number>();
	const filmSlugMap = new Map<string, string>();

	const selectedFilms = (result.films || []).filter((f: any) => selectedFilmIds.has(f._id));

	for (const film of selectedFilms) {
		const title = film.englishTitle || film.originalTitle || 'Untitled';
		let slug = slugify(title);
		const count = slugCounts.get(slug) ?? 0;
		slugCounts.set(slug, count + 1);
		if (count > 0) {
			slug = `${slug}-${slugify(film.directorName || 'unknown')}`;
		}
		filmSlugMap.set(film._id, slug);
	}

	const films = selectedFilms.map((film: any) => ({
		_id: film._id,
		englishTitle: film.englishTitle || film.originalTitle || 'Untitled',
		directorName: film.directorName || 'Unknown',
		length: film.length || 0,
		yearOfCompletion: film.yearOfCompletion,
		categories: film.categories || [],
		country: film.country,
		filmLanguage: film.filmLanguage,
		synopsis: film.synopsis || '',
		poster: film.poster || null,
		screenshot: film.screenshot || null,
		slug: filmSlugMap.get(film._id) || film._id,
	}));

	const metaCategories = (result.metaCategories || []).map((mc: any) => ({
		_id: mc._id,
		name: mc.name,
		description: mc.description || '',
		type: mc.type || 'auto',
		filmIds: (mc.filmIds || []).filter(
			(e: any) => e.filmId && selectedFilmIds.has(e.filmId)
		),
	}));

	const clusters = (result.clusters || []).map((c: any) => ({
		_id: c._id,
		name: c.name,
		description: c.description || '',
		keywords: c.keywords || [],
		highlightedFilmIds: (c.highlightedFilmIds || []).filter((id: string) =>
			selectedFilmIds.has(id)
		),
		relevantFilmIds: (c.relevantFilmIds || []).filter((id: string) =>
			selectedFilmIds.has(id)
		),
	}));

	const screenings = (result.screenings || []).map((s: any) => ({
		_id: s._id,
		name: s.title || 'Untitled Screening',
		filmIds: (s.filmIds || []).filter((id: string) => selectedFilmIds.has(id)),
	}));

	const filter = url.searchParams.get('filter') || null;

	return { films, metaCategories, clusters, screenings, filter };
}
