import { getDocument, groqQueries } from '$lib/sanity';
import type { FestivalSettings } from '$lib/sanity';

export const prerender = true;

export async function load() {
	const festivalSettings = await getDocument<FestivalSettings>(groqQueries.festivalSettings);
	return {
		festivalSettings: festivalSettings ?? null
	};
}
