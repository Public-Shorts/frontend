import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from '$env/static/public';
import { SANITY_TOKEN } from '$env/static/private';
import { createClient } from '@sanity/client';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const OPEN_CALL_DEADLINE = new Date('2026-01-11T23:59:59');

// Authenticated client for server-side operations (mutations, uploads)
const authenticatedClient = createClient({
	projectId: PUBLIC_SANITY_PROJECT_ID,
	dataset: PUBLIC_SANITY_DATASET,
	token: SANITY_TOKEN,
	useCdn: true,
	apiVersion: '2025-02-21'
});

// Session storage for temporary uploads
const sessionUploads = new Map<string, { screenshots: any[]; poster: any | null }>();

export const load: PageServerLoad = async ({ cookies }) => {
	if (new Date() > OPEN_CALL_DEADLINE) {
		redirect(302, '/opencall');
	}

	const sessionId = cookies.get('submit_session_id');

	if (sessionId && sessionUploads.has(sessionId)) {
		const uploads = sessionUploads.get(sessionId);
		return {
			uploadedImages: uploads
		};
	}

	return {
		uploadedImages: null
	};
};

async function uploadImageToSanity(file: File): Promise<any> {
	try {
		// console.log('Uploading to Sanity:', file.name, file.type, file.size);
		const buffer = await file.arrayBuffer();
		const asset = await authenticatedClient.assets.upload('image', Buffer.from(buffer), {
			filename: file.name,
			contentType: file.type
		});
		// console.log('Sanity upload complete, asset ID:', asset._id);

		const imageRef = {
			_type: 'image',
			asset: {
				_type: 'reference',
				_ref: asset._id
			}
		};
		// console.log('Created image reference:', imageRef);
		return imageRef;
	} catch (error) {
		console.error('Error uploading image:', error);
		throw new Error('Failed to upload image');
	}
}

export const actions = {
	uploadImage: async ({ request, cookies }) => {
		if (new Date() > OPEN_CALL_DEADLINE) {
			return fail(403, { error: 'Submissions are closed' });
		}
		try {
			const formData = await request.formData();
			const file = formData.get('file') as File;
			const type = formData.get('type')?.toString(); // 'screenshot' or 'poster'

			if (!file || file.size === 0) {
				return fail(400, { error: 'No file provided' });
			}

			// Upload to Sanity
			const asset = await uploadImageToSanity(file);

			// Get or create session ID
			let sessionId = cookies.get('submit_session_id');
			if (!sessionId) {
				sessionId = crypto.randomUUID();
				cookies.set('submit_session_id', sessionId, {
					path: '/submit',
					httpOnly: true,
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 // 24 hours
				});
			}

			// Store in session
			if (!sessionUploads.has(sessionId)) {
				sessionUploads.set(sessionId, { screenshots: [], poster: null });
			}

			const uploads = sessionUploads.get(sessionId)!;

			if (type === 'poster') {
				uploads.poster = asset;
			} else {
				uploads.screenshots.push(asset);
			}

			// console.log('Upload successful, returning asset:', asset);

			return {
				success: true,
				asset
			};
		} catch (error) {
			console.error('Upload error:', error);
			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to upload image'
			});
		}
	},

	deleteImage: async ({ request, cookies }) => {
		try {
			const formData = await request.formData();
			const assetId = formData.get('assetId')?.toString();
			const type = formData.get('type')?.toString();

			const sessionId = cookies.get('submit_session_id');
			if (!sessionId || !sessionUploads.has(sessionId)) {
				return fail(400, { error: 'No session found' });
			}

			const uploads = sessionUploads.get(sessionId)!;

			if (type === 'poster') {
				uploads.poster = null;
			} else {
				uploads.screenshots = uploads.screenshots.filter(
					(s) => s.asset._ref !== assetId?.replace('image-', '').replace(/-[a-z]+$/, '')
				);
			}

			return { success: true };
		} catch (error) {
			console.error('Delete error:', error);
			return fail(500, { error: 'Failed to delete image' });
		}
	},

	reorderScreenshots: async ({ request, cookies }) => {
		try {
			const formData = await request.formData();
			const order = JSON.parse(formData.get('order')?.toString() || '[]');

			const sessionId = cookies.get('submit_session_id');
			if (!sessionId || !sessionUploads.has(sessionId)) {
				return fail(400, { error: 'No session found' });
			}

			const uploads = sessionUploads.get(sessionId)!;
			const reordered = order
				.map((assetRef: string) => uploads.screenshots.find((s) => s.asset._ref === assetRef))
				.filter(Boolean);

			uploads.screenshots = reordered;

			return { success: true };
		} catch (error) {
			console.error('Reorder error:', error);
			return fail(500, { error: 'Failed to reorder images' });
		}
	},

	submit: async ({ request, cookies }) => {
		if (new Date() > OPEN_CALL_DEADLINE) {
			return fail(403, { error: 'Submissions are closed' });
		}
		try {
			const formData = await request.formData();

			// Extract and validate required fields
			const submitterName = formData.get('submitterName')?.toString();
			const email = formData.get('email')?.toString();
			const directorName = formData.get('directorName')?.toString();
			const originalTitle = formData.get('originalTitle')?.toString();
			const englishTitle = formData.get('englishTitle')?.toString();
			const yearOfCompletion = formData.get('yearOfCompletion')?.toString();
			const length = formData.get('length')?.toString();
			const filmLanguage = formData.get('filmLanguage')?.toString();
			const synopsis = formData.get('synopsis')?.toString();
			const categories = formData.get('categories')?.toString();
			const linkToWatch = formData.get('linkToWatch')?.toString();
			const linkPassword = formData.get('linkPassword')?.toString();
			const linkToDownload = formData.get('linkToDownload')?.toString();
			const termsAccepted = formData.get('termsAccepted') === 'on';
			const explicit = formData.get('explicit') === 'true';
			const explicitDetails = formData.get('explicitDetails')?.toString();
			const aiUsed = formData.get('aiUsed') === 'true';
			const aiExplanation = formData.get('aiExplanation')?.toString();
			const previousScreenings = formData.get('previousScreenings') === 'true';
			const previousScreeningLocations = formData.get('previousScreeningLocations')?.toString();

			// Validation
			const errors: Record<string, string> = {};

			if (!submitterName) errors.submitterName = 'Submitter name is required';
			if (!email) errors.email = 'Email is required';
			if (!directorName) errors.directorName = 'Director name is required';
			if (!originalTitle) errors.originalTitle = 'Original title is required';
			if (!englishTitle) errors.englishTitle = 'English title is required';
			if (!yearOfCompletion) {
				errors.yearOfCompletion = 'Year of completion is required';
			} else if (parseInt(yearOfCompletion) < 2023) {
				errors.yearOfCompletion = 'Film must have been completed in 2023 or after';
			}
			if (!length) {
				errors.length = 'Film length is required';
			} else if (parseInt(length) > 15) {
				errors.length = 'Film must be no longer than 15 minutes';
			}
			if (!filmLanguage) errors.filmLanguage = 'Film language is required';
			if (!synopsis) errors.synopsis = 'Synopsis is required';
			if (!categories) errors.categories = 'Categories are required';
			if (!linkToWatch) errors.linkToWatch = 'Link to watch is required';
			if (!linkToDownload) errors.linkToDownload = 'Link to download is required';
			if (!termsAccepted) errors.termsAccepted = 'You must accept the terms and conditions';

			// Conditional validation
			if (explicit && !explicitDetails) {
				errors.explicitDetails = 'Please specify what explicit content is in the film';
			}
			if (aiUsed && !aiExplanation) {
				errors.aiExplanation = 'Please explain how AI was used';
			}
			if (previousScreenings && !previousScreeningLocations) {
				errors.previousScreeningLocations = 'Please list previous screening locations';
			}

			if (Object.keys(errors).length > 0) {
				return fail(400, {
					errors,
					submitterName,
					email,
					phone: formData.get('phone')?.toString(),
					socialMedia: formData.get('socialMedia')?.toString(),
					website: formData.get('website')?.toString(),
					directorName,
					originalTitle,
					englishTitle,
					yearOfCompletion,
					length,
					filmLanguage,
					synopsis,
					categories,
					categoryOther: formData.get('categoryOther')?.toString(),
					linkToWatch,
					linkPassword,
					linkToDownload,
					explicitDetails,
					aiExplanation,
					previousScreeningLocations,
					castAndCrew: formData.get('castAndCrew')?.toString(),
					thanks: formData.get('thanks')?.toString(),
					additionalInfo: formData.get('additionalInfo')?.toString(),
					specialRequirements: formData.get('specialRequirements')?.toString()
				});
			}

			// Get uploaded images from session
			const sessionId = cookies.get('submit_session_id');
			let screenshotAssets: any[] = [];
			let posterAsset: any = null;

			if (sessionId && sessionUploads.has(sessionId)) {
				const uploads = sessionUploads.get(sessionId)!;
				screenshotAssets = uploads.screenshots;
				posterAsset = uploads.poster;
			}

			// Validate screenshots (required)
			if (screenshotAssets.length === 0) {
				errors.screenshots = 'At least one screenshot is required';
				return fail(400, { errors });
			}

			// Parse comma-separated values into arrays
			const filmLanguageArray = filmLanguage
				? filmLanguage.split(',').map((lang) => lang.trim())
				: [];
			const categoriesArray = categories ? categories.split(',').map((cat) => cat.trim()) : [];

			// Create submission document
			const submission = {
				_type: 'submission',
				submitterName,
				email,
				phone: formData.get('phone')?.toString() || undefined,
				socialMedia: formData.get('socialMedia')?.toString() || undefined,
				website: formData.get('website')?.toString() || undefined,
				directorName,
				originalTitle,
				englishTitle,
				yearOfCompletion: parseInt(yearOfCompletion),
				length: parseInt(length),
				filmLanguage: filmLanguageArray,
				synopsis,
				categories: categoriesArray,
				categoryOther: formData.get('categoryOther')?.toString() || undefined,
				explicit,
				explicitDetails: explicitDetails || undefined,
				aiUsed,
				aiExplanation: aiExplanation || undefined,
				previousScreenings,
				previousScreeningLocations: previousScreeningLocations || undefined,
				linkToWatch,
				linkPassword: linkPassword || undefined,
				linkToDownload,
				screenshots: screenshotAssets,
				poster: posterAsset || undefined,
				castAndCrew: formData.get('castAndCrew')?.toString() || undefined,
				thanks: formData.get('thanks')?.toString() || undefined,
				additionalInfo: formData.get('additionalInfo')?.toString() || undefined,
				specialRequirements: formData.get('specialRequirements')?.toString() || undefined,
				termsAccepted
			};

			// Submit to Sanity
			const result = await authenticatedClient.create(submission);

			// console.log('Submission created:', result._id);

			// Clear session uploads after successful submission
			if (sessionId && sessionUploads.has(sessionId)) {
				sessionUploads.delete(sessionId);
				cookies.delete('submit_session_id', { path: '/submit' });
			}

			return {
				success: true,
				submissionId: result._id,
				title: englishTitle,
				director: directorName,
				email: email,
				poster: posterAsset
			};
		} catch (error) {
			console.error('Submission error:', error);
			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to submit form'
			});
		}
	}
} satisfies Actions;
