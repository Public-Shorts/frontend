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

export async function load() {
	const [screenings, curators] = await Promise.all([
		getDocument<Screening[]>(groqQueries.screenings),
		getDocument<Curator[]>(groqQueries.activeCurators)
	]);
	return {
		screenings: screenings ?? [],
		curators: curators ?? []
	};
}
