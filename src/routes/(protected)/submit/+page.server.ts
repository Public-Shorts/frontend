import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from "$env/static/public";
import { SANITY_TOKEN } from "$env/static/private";
import { createClient } from "@sanity/client";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

// Authenticated client for server-side operations (mutations, uploads)
const authenticatedClient = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET,
  token: SANITY_TOKEN,
  useCdn: true,
  apiVersion: "2025-02-21",
});

async function uploadImageToSanity(file: File): Promise<any> {
  try {
    const buffer = await file.arrayBuffer();
    const asset = await authenticatedClient.assets.upload('image', Buffer.from(buffer), {
      filename: file.name,
      contentType: file.type,
    });
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export const actions = {
  default: async ({ request }) => {
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
          linkToDownload,
          explicitDetails,
          aiExplanation,
          previousScreeningLocations,
          castAndCrew: formData.get('castAndCrew')?.toString(),
          thanks: formData.get('thanks')?.toString(),
          additionalInfo: formData.get('additionalInfo')?.toString(),
          specialRequirements: formData.get('specialRequirements')?.toString(),
        });
      }

      // Handle file uploads
      const posterFile = formData.get('poster') as File | null;
      const screenshotsFiles = formData.getAll('screenshots') as File[];

      // Validate screenshots (required)
      const validScreenshots = screenshotsFiles.filter(f => f && f.size > 0);
      if (validScreenshots.length === 0) {
        errors.screenshots = 'At least one screenshot is required';
        return fail(400, { errors });
      }
      if (validScreenshots.length > 5) {
        errors.screenshots = 'Maximum 5 screenshots allowed';
        return fail(400, { errors });
      }

      // Upload screenshots
      const screenshotAssets = [];
      for (const screenshotFile of validScreenshots) {
        const asset = await uploadImageToSanity(screenshotFile);
        screenshotAssets.push(asset);
      }

      // Upload poster (optional)
      let posterAsset = null;
      if (posterFile && posterFile.size > 0) {
        posterAsset = await uploadImageToSanity(posterFile);
      }

      // Parse comma-separated values into arrays
      const filmLanguageArray = filmLanguage
        ? filmLanguage.split(',').map((lang) => lang.trim())
        : [];
      const categoriesArray = categories
        ? categories.split(',').map((cat) => cat.trim())
        : [];

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
        linkToDownload,
        screenshots: screenshotAssets,
        poster: posterAsset || undefined,
        castAndCrew: formData.get('castAndCrew')?.toString() || undefined,
        thanks: formData.get('thanks')?.toString() || undefined,
        additionalInfo: formData.get('additionalInfo')?.toString() || undefined,
        specialRequirements: formData.get('specialRequirements')?.toString() || undefined,
        termsAccepted,
      };

      // Submit to Sanity
      const result = await authenticatedClient.create(submission);

      console.log('Submission created:', result._id);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Submission error:', error);
      return fail(500, {
        error: error instanceof Error ? error.message : 'Failed to submit form',
      });
    }
  },
} satisfies Actions;
