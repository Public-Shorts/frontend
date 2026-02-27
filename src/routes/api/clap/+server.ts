import { json, error } from '@sveltejs/kit';
import { sanityWriteClient } from '$lib/server/sanityWriteClient';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { filmId, count, sessionId } = body;

	if (!filmId || !count || !sessionId) {
		error(400, 'Missing required fields: filmId, count, sessionId');
	}

	if (typeof count !== 'number' || count < 1) {
		error(400, 'count must be a positive number');
	}

	// Verify the film exists
	const filmExists = await sanityWriteClient.fetch(
		`count(*[_type == "submission" && _id == $filmId]) > 0`,
		{ filmId }
	);

	if (!filmExists) {
		error(404, 'Film not found');
	}

	// Upsert: if sessionId+filmId doc exists, patch count; otherwise create
	const existing = await sanityWriteClient.fetch(
		`*[_type == "audienceClap" && film._ref == $filmId && sessionId == $sessionId][0]._id`,
		{ filmId, sessionId }
	);

	if (existing) {
		await sanityWriteClient.patch(existing).set({ count }).commit();
	} else {
		await sanityWriteClient.create({
			_type: 'audienceClap',
			film: { _type: 'reference', _ref: filmId },
			count,
			sessionId,
			createdAt: new Date().toISOString()
		});
	}

	// Get total claps for this film
	const totalClaps = await sanityWriteClient.fetch(
		`math::sum(*[_type == "audienceClap" && film._ref == $filmId].count)`,
		{ filmId }
	);

	return json({ totalClaps: totalClaps || 0 });
};
