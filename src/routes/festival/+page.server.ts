import { getDocument, groqQueries } from '$lib/sanity';

type Screening = {
	_id: string;
	title: string;
	slug: string;
	date: string;
	location: string;
	description: string | null;
};

export async function load() {
	const screenings = await getDocument<Screening[]>(groqQueries.screenings);
	return { screenings: screenings ?? [] };
}
