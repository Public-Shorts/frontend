import { json, error } from '@sveltejs/kit';
import { sanityWriteClient } from '$lib/server/sanityWriteClient';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { filmId, text, sessionId } = body;

	if (!filmId || !text || !sessionId) {
		error(400, 'Missing required fields: filmId, text, sessionId');
	}

	if (typeof text !== 'string' || text.length > 300) {
		error(400, 'Comment must be 300 characters or less');
	}

	if (text.trim().length === 0) {
		error(400, 'Comment cannot be empty');
	}

	// Verify the film exists
	const filmExists = await sanityWriteClient.fetch(
		`count(*[_type == "submission" && _id == $filmId]) > 0`,
		{ filmId }
	);

	if (!filmExists) {
		error(404, 'Film not found');
	}

	// Check no existing comment for this sessionId+filmId
	const existing = await sanityWriteClient.fetch(
		`count(*[_type == "audienceComment" && film._ref == $filmId && sessionId == $sessionId])`,
		{ filmId, sessionId }
	);

	if (existing > 0) {
		error(409, 'You have already commented on this film');
	}

	await sanityWriteClient.create({
		_type: 'audienceComment',
		film: { _type: 'reference', _ref: filmId },
		text: text.trim(),
		sessionId,
		createdAt: new Date().toISOString()
	});

	return json({ success: true });
};
