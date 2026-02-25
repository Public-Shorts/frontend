import { dev } from '$app/environment';
import { getDocument, groqQueries } from '$lib/sanity';
import type { FestivalSettings } from '$lib/sanity';

export const prerender = true;

export async function load() {
	const [festivalSettings, scheduleDates] = await Promise.all([
		getDocument<FestivalSettings>(groqQueries.festivalSettings),
		getDocument<{ dateStart: string; dateEnd: string }>(
			`*[_id == "playbackSchedule"][0]{ dateStart, dateEnd }`
		)
	]);

	return {
		festivalSettings: festivalSettings ?? null,
		scheduleDateStart: scheduleDates?.dateStart ?? null,
		scheduleDateEnd: scheduleDates?.dateEnd ?? null,
		dev
	};
}
