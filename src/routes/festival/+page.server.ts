import { getDocument, groqQueries } from '$lib/sanity';

type Screening = {
	_id: string;
	title: string;
	slug: string;
	date: string;
	location: string;
	description: string | null;
};

type Curator = {
	_id: string;
	name: string;
};

type FilmEntry = {
	selectionScore: number;
	film: {
		_id: string;
		englishTitle: string;
		directorName: string;
		length: number;
		categories: string[];
		screenshot: { asset: { _id: string; url: string; metadata: unknown } } | null;
	} | null;
};

type FestivalSelection = {
	totalCount: number;
	films: FilmEntry[] | null;
};

const categoryLabels: Record<string, string> = {
	abstract: 'Abstract',
	animation: 'Animation',
	comedy: 'Comedy',
	dance: 'Dance',
	documentary: 'Documentary',
	environment: 'Environment / Nature',
	experimental: 'Experimental',
	horror: 'Horror',
	lgbtqia: 'LGBTQIA+',
	mobile: 'Mobile',
	micro: 'Micro-Short',
	music_video: 'Music Video',
	narrative: 'Narrative',
	performance: 'Performance',
	sci_fi_fantasy: 'Sci-Fi / Fantasy',
	social_impact: 'Social Impact',
	technology: 'Technology',
	urban: 'Urban',
	silent_visual: 'Visual-Only',
	other: 'Other'
};

export async function load() {
	const [screenings, curators, selection] = await Promise.all([
		getDocument<Screening[]>(groqQueries.screenings),
		getDocument<Curator[]>(groqQueries.activeCurators),
		getDocument<FestivalSelection>(groqQueries.festivalSelection)
	]);

	const films = (selection?.films ?? []).filter((e) => e.film);
	const totalFilms = films.length;
	const totalMinutes = films.reduce((sum, e) => sum + (e.film?.length ?? 0), 0);
	const avgMinutes = totalFilms > 0 ? Math.round(totalMinutes / totalFilms) : 0;

	// Aggregate categories
	const categoryCounts = new Map<string, number>();
	for (const entry of films) {
		for (const cat of entry.film?.categories ?? []) {
			categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
		}
	}
	const topCategories = [...categoryCounts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 8)
		.map(([key]) => categoryLabels[key] || key);

	// Top 10 screenshots (already sorted by selectionScore desc)
	const topScreenshots = films
		.slice(0, 10)
		.filter((e) => e.film?.screenshot)
		.map((e) => ({
			screenshot: e.film!.screenshot,
			alt: `${e.film!.englishTitle} by ${e.film!.directorName}`
		}));

	return {
		screenings: screenings ?? [],
		curators: curators ?? [],
		selection: {
			totalFilms,
			totalMinutes,
			avgMinutes,
			topCategories,
			topScreenshots
		}
	};
}
