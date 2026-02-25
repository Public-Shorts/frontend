import { createClient } from '@sanity/client';

const client = createClient({
	projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
	dataset: import.meta.env.PUBLIC_SANITY_DATASET,
	useCdn: true,
	apiVersion: '2025-02-21',
});

export async function fetchSanity<T = unknown>(
	query: string,
	params?: Record<string, unknown>
): Promise<T> {
	return client.fetch(query, params);
}
