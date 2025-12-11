<script lang="ts">
	import { enhance } from '$app/forms';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import type { PageProps, Snapshot } from './$types';
  import SimpleImage from '$lib/sanity/SimpleImage.svelte';
  import SEO from "$lib/components/SEO.svelte"
	import { ISO_LANGUAGES as LANGUAGES } from './languages';

	let { data, form }: PageProps = $props();

  // Image file management
  type UploadedImage = { asset: { _ref: string } };
  type ImagePreview = { id: string; file: File; preview: string; uploading?: boolean; uploaded?: UploadedImage };

  let i = $state(0)
  let unlocked = $derived(i > 7)

  // Form fields
  let submitterName = $state(form?.submitterName ?? "")
  let email = $state(form?.email ?? '')
  let phone = $state(form?.phone ?? '')
  let socialMedia = $state(form?.socialMedia ?? '')
  let website = $state(form?.website ?? '')
  let directorName = $state(form?.directorName ?? '')
  let originalTitle = $state(form?.originalTitle ?? "")
  let englishTitle = $state(form?.englishTitle ?? "")
  let yearOfCompletion = $state(form?.yearOfCompletion ?? "")
  let length = $state(form?.length ?? "")
  let videoLanguage = $state(form?.videoLanguage ?? "")
  let synopsis = $state(form?.synopsis ?? "")
  let categoryOther = $state(form?.categoryOther ?? "")
  let linkToWatch = $state(form?.linkToWatch ?? "")
  let linkPassword = $state(form?.linkPassword ?? "")
  let linkToDownload = $state(form?.linkToDownload ?? "")
  let castAndCrew = $state(form?.castAndCrew ?? "")
  let thanks = $state(form?.thanks ?? "")
  let explicitDetails = $state(form?.explicitDetails ?? "")
  let aiExplanation = $state(form?.aiExplanation ?? "")
  let previousScreeningLocations = $state(form?.previousScreeningLocations ?? "")
  let additionalInfo = $state(form?.additionalInfo ?? "")
  let specialRequirements = $state(form?.specialRequirements ?? "")
  let explicit = $state(false);
  let aiUsed = $state(false);
  let previousScreenings = $state(false);

  // Form helpers
  let screenshotFiles = $state<ImagePreview[]>([]);
  let posterFile = $state<ImagePreview | null>(null);
  let viewingImage = $state<{ src: string; asset?: UploadedImage; index?: number } | null>(null);
  let draggedIndex = $state<number | null>(null);
  let selectedCategories = $state<string[]>(form?.categories?.split(',').map(c => c.trim()) ?? []);
  let selectedLanguages = $state<string[]>(form?.filmLanguage?.split(',').map(l => l.trim()) ?? []);
  let showCategoryOther = $state(selectedCategories.includes('other'));
  let isSubmitting = $state(false);

  // Initialize from server data
  $effect(() => {
    if (data.uploadedImages) {
      screenshotFiles = data.uploadedImages.screenshots.map((asset: UploadedImage) => ({
        id: asset.asset._ref,
        file: null as any, // Already uploaded
        preview: '',
        uploaded: asset
      }));

      if (data.uploadedImages.poster) {
        posterFile = {
          id: data.uploadedImages.poster.asset._ref,
          file: null as any,
          preview: '',
          uploaded: data.uploadedImages.poster
        };
      }
    }
  });

  const progress = () => i++


  async function uploadFile(file: File, type: 'screenshot' | 'poster'): Promise<UploadedImage | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('?/uploadImage', {
        method: 'POST',
        body: formData,
        headers: {
          'x-sveltekit-action': 'true'
        }
      });

      const result = await response.json();

      // SvelteKit action responses have type: 'success' or 'failure'
      if (result.type === 'success' && result.data) {
        // Parse the data if it's a string (SvelteKit serializes it)
        const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;

        // Handle devalue serialization format - data comes as array
        // The devalue format uses numeric references, so we need to find the actual asset object
        // Structure: [{ success, asset }, true, { _type, asset }, "image", { _type, _ref }, "reference", "image-xxx"]
        // We need to build the proper asset object with the _ref string
        if (Array.isArray(data)) {
          // Find the image reference string (last item in array)
          const refString = data[data.length - 1];
          const asset = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: refString
            }
          };
          return asset;
        }
        return data.asset;
      }

      // Log error if upload failed
      if (result.type === 'failure') {
        console.error('Upload failed:', result.data);
      }

      return null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  }

  async function handleScreenshotsChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files).slice(0, 5 - screenshotFiles.length);

    for (const file of newFiles) {
      const preview: ImagePreview = {
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        uploading: true
      };

      screenshotFiles = [...screenshotFiles, preview];

      // Upload in background
      const uploaded = await uploadFile(file, 'screenshot');
      const index = screenshotFiles.findIndex(f => f.id === preview.id);

      if (index !== -1) {
        if (uploaded) {
          screenshotFiles[index] = {
            ...screenshotFiles[index],
            uploaded,
            uploading: false
          };
          screenshotFiles = [...screenshotFiles]; // Trigger reactivity
        } else {
          console.error('Upload failed for:', file.name);
          screenshotFiles[index] = {
            ...screenshotFiles[index],
            uploading: false
          };
          screenshotFiles = [...screenshotFiles]; // Trigger reactivity
        }
      }
    }

    // Reset input
    input.value = '';
  }

  async function handlePosterChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Clean up old preview
    if (posterFile && posterFile.preview) {
      URL.revokeObjectURL(posterFile.preview);
    }

    posterFile = {
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      uploading: true
    };

    // Upload in background
    const uploaded = await uploadFile(file, 'poster');
    if (posterFile) {
      if (uploaded) {
        posterFile = {
          ...posterFile,
          uploaded,
          uploading: false
        };
      } else {
        console.error('Poster upload failed');
        posterFile = {
          ...posterFile,
          uploading: false
        };
      }
    }

    input.value = '';
  }

  async function removeScreenshot(id: string) {
    const file = screenshotFiles.find(f => f.id === id);
    if (file) {
      if (file.preview) URL.revokeObjectURL(file.preview);

      // Delete from server if uploaded
      if (file.uploaded) {
        const formData = new FormData();
        formData.append('assetId', file.uploaded.asset._ref);
        formData.append('type', 'screenshot');

        await fetch('?/deleteImage', {
          method: 'POST',
          body: formData,
          headers: {
            'x-sveltekit-action': 'true'
          }
        });
      }
    }
    screenshotFiles = screenshotFiles.filter(f => f.id !== id);
  }

  async function removePoster() {
    if (posterFile) {
      if (posterFile.preview) URL.revokeObjectURL(posterFile.preview);

      // Delete from server if uploaded
      if (posterFile.uploaded) {
        const formData = new FormData();
        formData.append('assetId', posterFile.uploaded.asset._ref);
        formData.append('type', 'poster');

        await fetch('?/deleteImage', {
          method: 'POST',
          body: formData,
          headers: {
            'x-sveltekit-action': 'true'
          }
        });
      }

      posterFile = null;
    }
  }

  function viewImage(src: string, asset?: UploadedImage, index?: number) {
    viewingImage = { src, asset, index };
  }

  function closeViewer() {
    viewingImage = null;
  }

  function viewNext() {
    if (viewingImage?.index !== undefined && viewingImage.index < screenshotFiles.length - 1) {
      viewingImage = { src: screenshotFiles[viewingImage.index + 1].preview, index: viewingImage.index + 1 };
    }
  }

  function viewPrev() {
    if (viewingImage?.index !== undefined && viewingImage.index > 0) {
      viewingImage = { src: screenshotFiles[viewingImage.index - 1].preview, index: viewingImage.index - 1 };
    }
  }

  // Drag and drop handlers
  function handleDragStart(index: number) {
    draggedIndex = index;
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...screenshotFiles];
    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedItem);
    screenshotFiles = newFiles;
    draggedIndex = index;
  }

  async function handleDragEnd() {
    draggedIndex = null;

    // Sync order to server
    const order = screenshotFiles
      .filter(f => f.uploaded)
      .map(f => f.uploaded!.asset._ref);

    if (order.length > 0) {
      const formData = new FormData();
      formData.append('order', JSON.stringify(order));

      await fetch('?/reorderScreenshots', {
        method: 'POST',
        body: formData,
        headers: {
          'x-sveltekit-action': 'true'
        }
      });
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

	export const snapshot: Snapshot<string> = {
		capture: () => {
      const all = {
        i,
        submitterName,
        email,
        phone,
        socialMedia,
        website,
        directorName,
        selectedCategories,
        selectedLanguages,
        showCategoryOther,
        originalTitle,
        englishTitle,
        yearOfCompletion,
        length,
        videoLanguage,
        synopsis,
        categoryOther,
        linkToWatch,
        linkPassword,
        linkToDownload,
        castAndCrew,
        thanks,
        explicitDetails,
        aiExplanation,
        previousScreeningLocations,
        additionalInfo,
        specialRequirements,
        explicit,
        aiUsed,
        previousScreenings,
        // Store uploaded asset references so images persist
        screenshots: screenshotFiles
          .filter(f => f.uploaded)
          .map(f => ({ id: f.id, uploaded: f.uploaded })),
        poster: posterFile?.uploaded ? {
          id: posterFile.id,
          uploaded: posterFile.uploaded
        } : null
      }
      return JSON.stringify(all)
    },
		restore: (value) => {
      const parsed = JSON.parse(value)

      i = parsed.i
      submitterName = parsed.submitterName
      email = parsed.email
      phone = parsed.phone
      socialMedia = parsed.socialMedia
      website = parsed.website
      directorName = parsed.directorName
      selectedCategories = parsed.selectedCategories
      selectedLanguages = parsed.selectedLanguages
      showCategoryOther = parsed.showCategoryOther
      originalTitle = parsed.originalTitle
      englishTitle = parsed.englishTitle
      yearOfCompletion = parsed.yearOfCompletion
      length = parsed.length
      videoLanguage = parsed.videoLanguage
      synopsis = parsed.synopsis
      categoryOther = parsed.categoryOther
      linkToWatch = parsed.linkToWatch
      linkPassword = parsed.linkPassword
      linkToDownload = parsed.linkToDownload
      castAndCrew = parsed.castAndCrew
      thanks = parsed.thanks
      explicitDetails = parsed.explicitDetails
      aiExplanation = parsed.aiExplanation
      previousScreeningLocations = parsed.previousScreeningLocations
      additionalInfo = parsed.additionalInfo
      specialRequirements = parsed.specialRequirements
      explicit = parsed.explicit
      aiUsed = parsed.aiUsed
      previousScreenings = parsed.previousScreenings

      // Restore uploaded images
      if (parsed.screenshots && Array.isArray(parsed.screenshots)) {
        screenshotFiles = parsed.screenshots.map((s: any) => ({
          id: s.id,
          file: null as any,
          preview: '',
          uploaded: s.uploaded
        }));
      }

      if (parsed.poster) {
        posterFile = {
          id: parsed.poster.id,
          file: null as any,
          preview: '',
          uploaded: parsed.poster.uploaded
        };
      }
    }
	};

	const CATEGORIES = [
		{ title: 'Abstract', value: 'abstract' },
		{ title: 'Animation', value: 'animation' },
		{ title: 'Comedy', value: 'comedy' },
		{ title: 'Dance', value: 'dance' },
		{ title: 'Documentary', value: 'documentary' },
		{ title: 'Environment / Nature', value: 'environment' },
		{ title: 'Experimental', value: 'experimental' },
		{ title: 'Horror', value: 'horror' },
		{ title: 'LGBTQIA+', value: 'lgbtqia' },
		{ title: 'Made with a mobile phone', value: 'mobile' },
		{ title: 'Micro-Short', value: 'micro' },
		{ title: 'Music Video', value: 'music_video' },
		{ title: 'Narrative', value: 'narrative' },
		{ title: 'Performance', value: 'performance' },
		{ title: 'Science Fiction / Fantasy', value: 'sci_fi_fantasy' },
		{ title: 'Social Impact / Activism', value: 'social_impact' },
		{ title: 'Technology', value: 'technology' },
		{ title: 'Urban', value: 'urban' },
		{ title: 'Visual-Only', value: 'silent_visual' },
		{ title: 'Other', value: 'other' }
	];

	function toggleCategory(value: string) {
		if (selectedCategories.includes(value)) {
			selectedCategories = selectedCategories.filter((c) => c !== value);
		} else {
			selectedCategories = [...selectedCategories, value];
		}
		showCategoryOther = selectedCategories.includes('other');
	}

	let screenshotPreviews: string[] = [];
	let posterPreview: string | null = null;



</script>


<SEO title="Submit | Public Shorts | Berlin" />

{#if unlocked}

<GridLayout>
	<div class="md:order-last md:col-span-2">
		<div
			class="wrap-break-words flex flex-col gap-2 md:sticky md:top-8 md:max-h-[80vh] md:overflow-auto md:rounded md:bg-gallery-50 md:p-6"
		>
			<h2 class=" text-3xl font-bold">Open Call 2026</h2>

			<p class=" ">
				We welcome submissions until:<br />
				<em class="font-semibold not-italic">10th of January 2026</em>
			</p>

			<p class=" ">
				If you have any questions, please refer to our
				<a href="/FAQ" class="words text-accent-600 underline">FAQ</a>
				page before submitting.
			</p>

			<ol class="list-inside list-decimal pb-4 text-gallery-500">
				<li>Contact Information</li>
				<li>Video Information</li>
				<li>Media Files</li>
				<li>Credits</li>
				<li>Additional Information</li>
				<li>Terms and conditions</li>
			</ol>
			<button
				type="submit"
				form="submissionForm"
				disabled={isSubmitting}
				class="hidden w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent-500 px-8 py-4 font-semibold text-white transition-all hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-accent-300 disabled:opacity-50 md:flex"
			>
				{#if isSubmitting}
					<div role="status">
						<svg
							aria-hidden="true"
							class="text-neutral-tertiary h-4 w-4 animate-spin fill-gallery-600"
							viewBox="0 0 100 101"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
								fill="currentColor"
							/>
							<path
								d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
								fill="currentFill"
							/>
						</svg>
						<span class="sr-only">Loading...</span>
					</div>
				{/if}
				{isSubmitting ? 'Submitting...' : 'Submit Video'}
				<p></p>
			</button>
			{#if form?.success}
				<div class="fixed right-6 bottom-6 z-50 max-w-md rounded bg-accent-500 p-4 shadow-lg">
					<p class="font-semibold">Submission successful! Thank you for submitting your video.</p>
				</div>
			{/if}

			{#if form?.error}
				<div class="fixed right-6 bottom-6 z-50 max-w-md rounded bg-accent-800 p-4 shadow-lg">
					<p class="font-semibold">Error: {form.error}</p>
				</div>
			{/if}
		</div>
	</div>

	<div class="md:order-first md:col-span-4">
		<form
    action="?/submit"
			method="POST"
			enctype="multipart/form-data"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
        if (result.type === 'success' && result.data?.success) {
          // Build success page URL with params
          const params = new URLSearchParams({
            title: String(result.data.title ?? ''),
            director: String(result.data.director ?? ''),
            email: String(result.data.email ?? ''),
          });

          if (result.data.poster) {
            params.set('poster', encodeURIComponent(JSON.stringify(result.data.poster)));
          }

          window.location.href = `/submit/success?${params.toString()}`;
        } else {
  					await update();
  					isSubmitting = false;
        }
				};
			}}
			class="space-y-8"
			id="submissionForm"
		>
			<!-- Contact Information -->
			<section class="space-y-4">
				<h2 class=" border-gallery-300 pb-2 font-semibold">Contact Information</h2>

      <div>
        <label for="submitterName" class="block mb-2">
          Name of the person submitting <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="submitterName"
          name="submitterName"
          bind:value={submitterName}
          required
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        <p class="text-sm text-gallery-500 mt-1">
          This person is responsible for the accuracy of the information given in this form and shall be informed about the selection result.
        </p>
        {#if form?.errors?.submitterName}
          <p class="text-red-500 text-sm mt-1">{form.errors.submitterName}</p>
        {/if}
      </div>

				<div>
					<label for="email" class="mb-2 block">
						Email <span class="text-red-500">*</span>
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						bind:value={email}
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
					{#if form?.errors?.email}
						<p class="mt-1 text-sm text-red-500">{form.errors.email}</p>
					{/if}
				</div>

				<div>
					<label for="phone" class="mb-2 block">Phone</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						bind:value={phone}
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
				</div>
			</section>

			<!-- Video Information -->
			<section class="space-y-4">
				<h2 class=" border-gallery-300 pb-2 font-semibold">Video Information</h2>

				<div>
					<label for="directorName" class="mb-2 block">
						Name of the Director(s) <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="directorName"
						name="directorName"
						required
						bind:value={directorName}
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
					<p class="mt-1 text-sm text-gallery-500">The person who made the video.</p>
					{#if form?.errors?.directorName}
						<p class="mt-1 text-sm text-red-500">{form.errors.directorName}</p>
					{/if}
				</div>
				<div>
					<label for="socialMedia" class="mb-2 block">Social Media</label>
					<input
						type="text"
						id="socialMedia"
						name="socialMedia"
						bind:value={socialMedia}
						placeholder="Instagram etc."
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
				</div>

				<div>
					<label for="website" class="mb-2 block">Website</label>
					<input
						type="url"
						id="website"
						name="website"
						bind:value={website}
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
				</div>


      <div>
        <label for="originalTitle" class="block mb-2">
          Original Title <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="originalTitle"
          name="originalTitle"
          required
          bind:value={originalTitle}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        {#if form?.errors?.originalTitle}
          <p class="text-red-500 text-sm mt-1">{form.errors.originalTitle}</p>
        {/if}
      </div>

				<div>
					<label for="englishTitle" class="mb-2 block">
						English Title <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="englishTitle"
						name="englishTitle"
						required
						bind:value={englishTitle}
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
					{#if form?.errors?.englishTitle}
						<p class="mt-1 text-sm text-red-500">{form.errors.englishTitle}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="yearOfCompletion" class="mb-2 block">
							Year of Completion <span class="text-red-500">*</span>
						</label>
						<input
							type="number"
							id="yearOfCompletion"
							name="yearOfCompletion"
							required
							min="2023"
							max="2100"
							bind:value={yearOfCompletion}
							class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
						/>
						<p class="mt-1 text-sm text-gallery-500">
							Please note that submitted works must have been completed in 2023 or after.
						</p>
						{#if form?.errors?.yearOfCompletion}
							<p class="mt-1 text-sm text-red-500">{form.errors.yearOfCompletion}</p>
						{/if}
					</div>

					<div>
						<label for="length" class="mb-2 block">
							Length (minutes) <span class="text-red-500">*</span>
						</label>
						<input
							type="number"
							id="length"
							name="length"
							required
							min="1"
							max="15"
							bind:value={length}
							class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
						/>
						<p class="mt-1 text-sm text-gallery-500">
							Submitted works should be no longer than 15 minutes. Round to the nearest minute.
						</p>
						{#if form?.errors?.length}
							<p class="mt-1 text-sm text-red-500">{form.errors.length}</p>
						{/if}
					</div>
				</div>

				<div>
					<label for="videoLanguage" class="mb-2 block">
						Video Language <span class="text-red-500">*</span>
					</label>
					<select
						id="videoLanguage"
						name="videoLanguage"
						required
						bind:value={videoLanguage}
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					>
						<option value="">Select a language...</option>
						{#each LANGUAGES as language}
							<option value={language.value}>{language.title}</option>
						{/each}
					</select>
					<input type="hidden" name="filmLanguage" value={videoLanguage} />
					{#if form?.errors?.videoLanguage}
						<p class="mt-1 text-sm text-red-500">{form.errors.videoLanguage}</p>
					{/if}
					{#if form?.errors?.filmLanguage}
						<p class="mt-1 text-sm text-red-500">{form.errors.filmLanguage}</p>
					{/if}
				</div>

				<div>
					<label for="synopsis" class="mb-2 block">
						Short Synopsis <span class="text-red-500">*</span>
					</label>
					<textarea
						id="synopsis"
						name="synopsis"
						required
						bind:value={synopsis}
						maxlength="800"
						rows="6"
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					></textarea>
					<p class="mt-1 text-sm text-gallery-500">Up to 150 words, 800 characters with space</p>
					{#if form?.errors?.synopsis}
						<p class="mt-1 text-sm text-red-500">{form.errors.synopsis}</p>
					{/if}
				</div>

        <div>
          <h2 class="mb-2 block">
            Categories <span class="text-red-500">*</span>
          </h2>
          <div
            class="grid grid-flow-col auto-rows-fr grid-rows-7 gap-2 rounded border border-gallery-300 bg-gallery-50 p-3 md:grid-rows-7"
          >
            {#each CATEGORIES as category}
              <label class="flex cursor-pointer items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.value)}
                  onchange={() => toggleCategory(category.value)}
                  disabled={!selectedCategories.includes(category.value) && selectedCategories.length >= 5}
                  class="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span class="text-sm" class:opacity-50={!selectedCategories.includes(category.value) && selectedCategories.length >= 5}>{category.title}</span>
              </label>
            {/each}
          </div>
          <p class="mt-1 text-sm text-gallery-500">
            Please select maximum 5 categories that apply to your video. ({selectedCategories.length}/5 selected)
          </p>
          <input type="hidden" name="categories" value={selectedCategories.join(', ')} />
          {#if form?.errors?.categories}
            <p class="mt-1 text-sm text-red-500">{form.errors.categories}</p>
          {/if}
        </div>

				{#if showCategoryOther}
					<div>
						<label for="categoryOther" class="mb-2 block">Please specify other categories</label>
						<input
							type="text"
							id="categoryOther"
							name="categoryOther"
							bind:value={categoryOther}
							class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
						/>
					</div>
				{/if}
			</section>

			<!-- Media Files -->
			<section class="space-y-4">
				<h2 class=" border-gallery-300 pb-2 font-semibold">Media Files</h2>

				<div>
					<label for="linkToWatch" class="mb-2 block">
						Link to Watch <span class="text-red-500">*</span>
					</label>
					<input
						type="url"
						id="linkToWatch"
						name="linkToWatch"
						required
						bind:value={linkToWatch}
						placeholder="https://vimeo.com/..."
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
					<p class="mt-1 text-sm text-gallery-500">
						Make sure the link is working. Needs to be accessible until the start of the festival.
					</p>
					{#if form?.errors?.linkToWatch}
						<p class="mt-1 text-sm text-red-500">{form.errors.linkToWatch}</p>
					{/if}
				</div>

      <div>
        <label for="linkPassword" class="block mb-2">Link Password</label>
        <input
          type="text"
          id="linkPassword"
          name="linkPassword"
          bind:value={linkPassword}
          placeholder="Password (if required)"
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        <p class="text-sm text-gallery-500 mt-1">If we need a password to see your video, add it here</p>
      </div>

				<div>
					<label for="linkToDownload" class="mb-2 block"
						>Link to Download <span class="text-red-500">*</span></label
					>
					<input
						type="url"
						id="linkToDownload"
						name="linkToDownload"
						required
						bind:value={linkToDownload}
						placeholder="https://drive.google.com/..."
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
					<p class="mt-1 text-sm text-gallery-500">
						Make sure the link is working and does not expire – like WeTransfer. It's best to use a
						drive or cloud service. Please provide a file with English subtitles.
					</p>
					{#if form?.errors?.linkToDownload}
						<p class="mt-1 text-sm text-red-500">{form.errors.linkToDownload}</p>
					{/if}
				</div>

      <div>
        <label for="screenshots" class="block mb-2">
          Stills <span class="text-red-500">*</span>
          <span class="text-sm font-normal text-gallery-500">({screenshotFiles.length}/5)</span>
        </label>

        {#if screenshotFiles.length > 0}
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 p-3 bg-gallery-50 border border-gallery-300 rounded">
            {#each screenshotFiles as screenshot, index (screenshot.id + index)}
              <div
          class="relative group cursor-move bg-white rounded border-2 transition-all"
          class:border-accent-500={draggedIndex === index}
          class:border-gallery-300={draggedIndex !== index}
          class:opacity-50={draggedIndex === index || screenshot.uploading}
          draggable="true"
          ondragstart={() => handleDragStart(index)}
          ondragover={(e) => handleDragOver(e, index)}
          ondragend={handleDragEnd}
          role="button"
          tabindex="0"
              >
          <button
            type="button"
            onclick={() => viewImage(screenshot.preview, screenshot.uploaded, index)}
            class="w-full aspect-video overflow-hidden rounded-t relative"
            disabled={screenshot.uploading}
          >
            {#if screenshot.uploaded}
              <SimpleImage
                asset={screenshot.uploaded}
                alt="Screenshot {index + 1}"
                width={400}
                class="w-full h-full object-cover"
              />
            {:else}
              <img
                src={screenshot.preview}
                alt="Screenshot {index + 1}"
                class="w-full h-full object-cover"
              />
            {/if}
            {#if screenshot.uploading}
              <div class="absolute inset-0 bg-gallery-900 bg-opacity-50 flex items-center justify-center">
                <div class="text-white text-xs">Uploading...</div>
              </div>
            {/if}
          </button>
          <div class="p-2 text-xs">
            <p class="truncate text-gallery-700 font-medium">{screenshot.file?.name || 'Uploaded image'}</p>
            {#if screenshot.file}
              <p class="text-gallery-500">{formatFileSize(screenshot.file.size)}</p>
            {/if}
          </div>
          <button
            type="button"
            onclick={() => removeScreenshot(screenshot.id)}
            class="absolute top-1 right-1 bg-gallery-900 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-500 flex items-center justify-center"
            aria-label="Remove screenshot"
            disabled={screenshot.uploading}
          >
            ✕
          </button>
          <div class="absolute top-1 left-1 bg-gallery-900 text-white px-2 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {index + 1}
          </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if screenshotFiles.length < 5}
          <label for="screenshots" class="relative block w-full p-4 bg-gallery-50 border-2 border-gallery-300 rounded cursor-pointer hover:border-accent-500 transition-colors text-center">
            <span class="inline-block px-4 py-2 bg-accent-500 text-white rounded font-medium hover:bg-accent-600 transition-colors">
              Choose Files
            </span>
            <span class="block mt-2 text-sm text-gallery-600">
              or drag and drop
            </span>
            <input
              type="file"
              id="screenshots"
              accept="image/*"
              multiple
              onchange={handleScreenshotsChange}
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        {/if}

        <p class="text-sm text-gallery-500 mt-1">Please attach up to 5video stills from your work. Drag to reorder.</p>
        {#if screenshotFiles.length === 0}
          <p class="text-red-500 text-sm mt-1">At least one still is required</p>
        {/if}
        {#if form?.errors?.screenshots}
          <p class="text-red-500 text-sm mt-1">{form.errors.screenshots}</p>
        {/if}
            </div>

            <div>
        <label for="poster" class="block mb-2">Poster</label>

        {#if posterFile}
          <div class="mb-3 p-3 bg-gallery-50 border border-gallery-300 rounded">
            <div class="relative group max-w-xs mx-auto bg-white rounded border-2 border-gallery-300" class:opacity-50={posterFile.uploading}>
              <button
          type="button"
          onclick={() => posterFile && viewImage(posterFile.preview, posterFile.uploaded)}
          class="w-full aspect-2/3 overflow-hidden rounded-t relative"
          disabled={posterFile.uploading}
              >
          {#if posterFile.uploaded}
            <SimpleImage
              asset={posterFile.uploaded}
              alt="Film poster"
              width={400}
              class="w-full h-full object-cover"
            />
          {:else}
            <img
              src={posterFile.preview}
              alt="Film poster"
              class="w-full h-full object-cover"
            />
          {/if}
          {#if posterFile.uploading}
            <div class="absolute inset-0 bg-gallery-900 bg-opacity-50 flex items-center justify-center">
              <div class="text-white text-xs">Uploading...</div>
            </div>
          {/if}
              </button>
              <div class="p-2 text-xs">
          <p class="truncate text-gallery-700 font-medium">{posterFile.file?.name || 'Uploaded image'}</p>
          {#if posterFile.file}
            <p class="text-gallery-500">{formatFileSize(posterFile.file.size)}</p>
          {/if}
              </div>
              <button
          type="button"
          onclick={removePoster}
          class="absolute top-1 right-1 bg-gallery-900 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-500 flex items-center justify-center"
          aria-label="Remove poster"
          disabled={posterFile.uploading}
              >
          ✕
              </button>
            </div>
          </div>
        {/if}

        {#if !posterFile}
          <label for="poster" class="relative block w-full p-4 bg-gallery-50 border-2 border-gallery-300 rounded cursor-pointer hover:border-accent-500 transition-colors text-center">
            <span class="inline-block px-4 py-2 bg-accent-500 text-white rounded font-medium hover:bg-accent-600 transition-colors">
              Choose File
            </span>
            <span class="block mt-2 text-sm text-gallery-600">
              or drag and drop
            </span>
            <input
              type="file"
              id="poster"
              accept="image/*"
              onchange={handlePosterChange}
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        {/if}

        <p class="text-sm text-gallery-500 mt-1">Upload your film poster (JPG, PNG, etc.)</p>
        {#if form?.errors?.poster}
          <p class="text-red-500 text-sm mt-1">{form.errors.poster}</p>
        {/if}
            </div>
          </section>


			<!-- Credits -->
			<section class="space-y-4">
				<h2 class=" border-gallery-300 pb-2 font-semibold">Credits</h2>

				<div>
					<label for="castAndCrew" class="mb-2 block">Cast and Crew</label>
					<textarea
						id="castAndCrew"
						name="castAndCrew"
						bind:value={castAndCrew}
						rows="6"
						placeholder="List your cast, crew members, and their roles..."
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					></textarea>
				</div>

				<div>
					<label for="thanks" class="mb-2 block">Thanks</label>
					<textarea
						id="thanks"
						name="thanks"
						bind:value={thanks}
						rows="4"
						placeholder="Acknowledgments and thanks..."
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					></textarea>
				</div>
			</section>

			<!-- Additional Information -->
			<section class="space-y-4">
				<h2 class=" border-gallery-300 pb-2 font-semibold">Additional Information</h2>

				<div class="space-y-2">
					<label class="flex items-start">
						<input type="checkbox" name="explicit" value="true" bind:checked={explicit} class="mt-1 mr-2" />
						<span>
							This video contains explicit content
							<span class="mt-1 block text-sm text-gallery-500">
								We will be showing works in a public place, whcih also happens to be across a
								kindergarten. Please indicate whether your work contains any of the following
								elements: Nudity, Sexual content, Blood/Violence, Epilepsi triggers, Strong
								language, Disturbing/triggering imagery.
							</span>
						</span>
					</label>

					{#if explicit}
						<div class="ml-6">
							<label for="explicitDetails" class="mb-2 block text-sm">
								What is explicit? <span class="text-red-500">*</span>
							</label>
							<textarea
								id="explicitDetails"
								name="explicitDetails"
								bind:value={explicitDetails}
								rows="3"
								required
								class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
							></textarea>
							{#if form?.errors?.explicitDetails}
								<p class="mt-1 text-sm text-red-500">{form.errors.explicitDetails}</p>
							{/if}
						</div>
					{/if}
				</div>

				<div class="space-y-2">
					<label class="flex items-start">
						<input type="checkbox" name="aiUsed" value="true" bind:checked={aiUsed} class="mt-1 mr-2" />
						<span>
							AI was used in the creation of this video
							<span class="mt-1 block text-sm text-gallery-500">
								For transparency purposes, was AI used in any way for the making of this video?
							</span>
						</span>
					</label>

					{#if aiUsed}
						<div class="ml-6">
							<label for="aiExplanation" class="mb-2 block text-sm">
								If yes, please tell us in a short text how AI was used: <span class="text-red-500">*</span>
							</label>
							<textarea
								id="aiExplanation"
								name="aiExplanation"
								bind:value={aiExplanation}
								rows="3"
								required
								class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
							></textarea>
							{#if form?.errors?.aiExplanation}
								<p class="mt-1 text-sm text-red-500">{form.errors.aiExplanation}</p>
							{/if}
						</div>
					{/if}
				</div>

				<div class="space-y-2">
					<label class="flex items-start">
						<input type="checkbox" name="previousScreenings" value="true" bind:checked={previousScreenings} class="mt-1 mr-2" />
						<span>
							This video has been screened previously
							<span class="mt-1 block text-sm text-gallery-500">
								Has the video been or will it be presented at other festivals?
							</span>
						</span>
					</label>

					{#if previousScreenings}
						<div class="ml-6">
							<label for="previousScreeningLocations" class="mb-2 block text-sm">
								Previous screening locations and year <span class="text-red-500">*</span>
							</label>
							<textarea
								id="previousScreeningLocations"
								name="previousScreeningLocations"
								bind:value={previousScreeningLocations}
								rows="3"
								placeholder="Festival names, venues, dates..."
								required
								class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
							></textarea>
							{#if form?.errors?.previousScreeningLocations}
								<p class="mt-1 text-sm text-red-500">{form.errors.previousScreeningLocations}</p>
							{/if}
						</div>
					{/if}
				</div>

				<div>
					<label for="additionalInfo" class="mb-2 block">Additional Information</label>
					<textarea
						id="additionalInfo"
						name="additionalInfo"
						bind:value={additionalInfo}
						rows="4"
						placeholder="Anything else that needs to be known about the creation process"
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					></textarea>
				</div>

				<div>
					<label for="specialRequirements" class="mb-2 block">Special Screening Requirements</label>
					<textarea
						id="specialRequirements"
						name="specialRequirements"
						bind:value={specialRequirements}
						rows="3"
						placeholder="Please let us know if your work has any special technical or spatial requirements for presentation (e.g., multi-channel sound, specific volume levels, unusual aspect ratio, looping instructions, external files, physical objects)."
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					></textarea>
				</div>
			</section>

			<!-- Terms and Conditions -->
			<section class="space-y-4">
				<h2 class=" border-gallery-300 pb-2 font-semibold">Terms and Conditions</h2>

				<label class="flex items-start">
					<input type="checkbox" name="termsAccepted" required class="mt-1 mr-2" />
					<span>
						I accept the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer"
							>terms and conditions</a
						> <span class="text-red-500">*</span>
						<ul class="mt-1 ml-4 block list-disc space-y-1 text-sm text-gallery-500">
							<li>All information given above is correct</li>
							<li>
								I accept that the festival may use this information, including the screenshots, when
								promoting the festival, whether for non-commercial or commercial endeavors
							</li>
							<li>No copyrighted material has been used without proper authorization</li>
							<li>The festival has the right to show this work within the festival</li>
						</ul>
					</span>
				</label>
				{#if form?.errors?.termsAccepted}
					<p class="text-sm text-red-500">{form.errors.termsAccepted}</p>
				{/if}
			</section>

			<!-- Submit Button -->
			<div class="pt-4 md:hidden">
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full cursor-pointer rounded-lg bg-accent-500 px-8 py-4 font-semibold text-white transition-all hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSubmitting ? 'Submitting...' : 'Submit Video'}
				</button>
			</div>
		</form>
	</div>

</GridLayout>
{:else}
<div class="absolute w-full h-20 bottom-0 left-0 flex justify-center items-center">
  <button class:text-accent-500={i > 6} class:font-bold={i > 6} onclick={progress}>
    Datenschutz
  </button>
</div>
{/if}
<!-- Fullscreen Image Viewer Modal -->
{#if viewingImage}
  <div
    class="fixed inset-0 bg-gallery-900 bg-opacity-95 z-50 flex items-center justify-center p-4"
    onclick={closeViewer}
    onkeydown={(e) => e.key === 'Escape' && closeViewer()}
    role="dialog"
    aria-modal="true"
    aria-label="Image viewer"
    tabindex="-1"
  >
    <button
      type="button"
      onclick={closeViewer}
      class="absolute top-4 right-4 bg-white text-gallery-900 w-10 h-10 rounded-full hover:bg-accent-500 hover:text-white transition-colors flex items-center justify-center text-xl font-bold z-10"
      aria-label="Close viewer"
    >
      ✕
    </button>

    {#if viewingImage.index !== undefined}
      <button
        type="button"
        onclick={(e) => { e.stopPropagation(); viewPrev(); }}
        disabled={viewingImage.index === 0}
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white text-gallery-900 w-12 h-12 rounded-full hover:bg-accent-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-2xl font-bold"
        aria-label="Previous image"
      >
        ‹
      </button>

      <button
        type="button"
        onclick={(e) => { e.stopPropagation(); viewNext(); }}
        disabled={viewingImage.index === screenshotFiles.length - 1}
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-gallery-900 w-12 h-12 rounded-full hover:bg-accent-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-2xl font-bold"
        aria-label="Next image"
      >
        ›
      </button>
        <div
          class="max-w-7xl max-h-full"
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => e.stopPropagation()}
          role="presentation"
        >
    
          {#if viewingImage.asset}
            <SimpleImage
              asset={viewingImage.asset}
              alt="Full size preview"
              width={1920}
              class="max-w-full max-h-[90vh] object-contain rounded"
            />
          {:else}
            <img
              src={viewingImage.src}
              alt="Full size preview"
              class="max-w-full max-h-[90vh] object-contain rounded"
            />
          {/if}
          {#if viewingImage.index !== undefined}
            <p class="text-center text-white mt-4 text-sm">
              Image {viewingImage.index + 1} of {screenshotFiles.length}
            </p>
          {/if}
        </div>
        {/if}
      </div>
    {/if}



<style>
	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-accent-500);
	}
</style>