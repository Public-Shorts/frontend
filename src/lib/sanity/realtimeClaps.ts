import { client } from '$lib/sanity';

type ClapListener = {
	claps: Map<string, number>;
	subscribe: (callback: (claps: Map<string, number>) => void) => () => void;
	destroy: () => void;
};

export function createClapListener(initialClaps: Record<string, number>): ClapListener {
	const claps = new Map<string, number>(Object.entries(initialClaps));
	const subscribers = new Set<(claps: Map<string, number>) => void>();
	let subscription: { unsubscribe: () => void } | null = null;

	function notify() {
		for (const cb of subscribers) {
			cb(claps);
		}
	}

	async function refreshFilmClaps(filmRef: string) {
		const total = await client.fetch(
			`math::sum(*[_type == "audienceClap" && film._ref == $filmId].count)`,
			{ filmId: filmRef }
		);
		claps.set(filmRef, total || 0);
		notify();
	}

	// Listen for audienceClap mutations
	const query = `*[_type == "audienceClap"]`;
	subscription = client.listen(query, {}, { includeResult: true }).subscribe({
		next(event) {
			if (event.type === 'mutation' && event.result) {
				const filmRef = event.result.film?._ref;
				if (filmRef) {
					refreshFilmClaps(filmRef);
				}
			}
		}
	});

	return {
		claps,
		subscribe(callback) {
			subscribers.add(callback);
			return () => subscribers.delete(callback);
		},
		destroy() {
			subscription?.unsubscribe();
			subscribers.clear();
		}
	};
}
