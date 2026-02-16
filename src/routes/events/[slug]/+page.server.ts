import { error } from '@sveltejs/kit';
import { getDocument, groqQueries } from '$lib/sanity';

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

type Screening = {
	_id: string;
	title: string;
	slug: string;
	date: string;
	location: string;
	description: string | null;
	films: FilmSummary[] | null;
};

export async function load({ params }) {
	const screening = await getDocument<Screening>(groqQueries.screening, { slug: params.slug });

	if (!screening) {
		error(404, 'Event not found');
	}

	return { screening };
}
