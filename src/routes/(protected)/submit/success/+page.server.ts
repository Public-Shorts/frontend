import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const title = url.searchParams.get('title');
  const director = url.searchParams.get('director');
  const email = url.searchParams.get('email');
  const poster = url.searchParams.get('poster');

  // If no data is present, redirect back to submit page
  if (!title || !email) {
    throw redirect(303, '/submit');
  }

  return {
    title,
    director,
    email,
    poster: poster ? JSON.parse(decodeURIComponent(poster)) : null
  };
};
