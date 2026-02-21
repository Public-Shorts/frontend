import { getDocument, groqQueries } from '$lib/sanity';

type ScheduleEntry = {
	startTime: string;
	endTime: string;
	durationSeconds: number;
	film: {
		_id: string;
		englishTitle: string;
		originalTitle: string;
		directorName: string;
		length: number;
		categories: string[];
		poster: { asset: { _id: string; url: string } } | null;
		screenshot: { asset: { _id: string; url: string } } | null;
	} | null;
};

type PlaybackSchedule = {
	publishedAt: string;
	dateStart: string;
	dateEnd: string;
	totalEntries: number;
	entries: ScheduleEntry[] | null;
};

export async function load() {
	const data = await getDocument<PlaybackSchedule>(groqQueries.playbackSchedule);
	const entries = data?.entries?.filter((e) => e.film) ?? [];

	return {
		schedule: data ?? null,
		entries,
	};
}
