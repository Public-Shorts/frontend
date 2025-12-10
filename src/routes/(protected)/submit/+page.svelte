<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageProps, Snapshot } from './$types';
  import SimpleImage from '$lib/sanity/SimpleImage.svelte';
  import SEO from "$lib/components/SEO.svelte"

  let { data, form }: PageProps = $props();

  let i = $state(0)
  let unlocked = $derived(i > 7)
  let submitterName = $state(form?.submitterName ?? "")
  let email = $state(form?.email ?? '')
  let phone = $state(form?.phone ?? '')
  let socialMedia = $state(form?.socialMedia ?? '')
  let website = $state(form?.website ?? '')
  let directorName = $state(form?.directorName ?? '')

  // Image file management
  type UploadedImage = { asset: { _ref: string } };
  type ImagePreview = { id: string; file: File; preview: string; uploading?: boolean; uploaded?: UploadedImage };

  let screenshotFiles = $state<ImagePreview[]>([]);
  let posterFile = $state<ImagePreview | null>(null);
  let viewingImage = $state<{ src: string; asset?: UploadedImage; index?: number } | null>(null);
  let draggedIndex = $state<number | null>(null);

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

  let selectedCategories = $state<string[]>(form?.categories?.split(',').map(c => c.trim()) ?? []);
  let selectedLanguages = $state<string[]>(form?.filmLanguage?.split(',').map(l => l.trim()) ?? []);
  let showCategoryOther = $state(selectedCategories.includes('other'));
  let isSubmitting = $state(false);

  const progress = () => i++

  // Helper functions for file handling
  function createImagePreview(file: File): ImagePreview {
    return {
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    };
  }

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
      console.log('Upload response:', result);

      // SvelteKit action responses have type: 'success' or 'failure'
      if (result.type === 'success' && result.data) {
        // Parse the data if it's a string (SvelteKit serializes it)
        const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        console.log('Parsed data:', data);

        // Handle devalue serialization format - data comes as array
        // Structure is [{ success, asset }, true, { _type, asset }, ...]
        // We want the first object's asset property, which is at index 2
        const asset = Array.isArray(data) ? data[2] : data.asset;
        console.log('Extracted asset:', asset);
        return asset;
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
          console.log('Upload successful, updating preview:', uploaded);
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
        console.log('Poster upload successful:', uploaded);
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
    { title: 'Documentary', value: 'documentary' },
    { title: 'Experimental', value: 'experimental' },
    { title: 'Animation', value: 'animation' },
    { title: 'Narrative', value: 'narrative' },
    { title: 'LGBTQAI+', value: 'lgbtqai' },
    { title: 'Other', value: 'other' },
  ];

  const LANGUAGES = [
    { title: 'English', value: 'english' },
    { title: 'Spanish', value: 'spanish' },
    { title: 'French', value: 'french' },
    { title: 'German', value: 'german' },
    { title: 'Italian', value: 'italian' },
    { title: 'Portuguese', value: 'portuguese' },
    { title: 'Mandarin', value: 'mandarin' },
    { title: 'Arabic', value: 'arabic' },
    { title: 'Japanese', value: 'japanese' },
    { title: 'Korean', value: 'korean' },
    { title: 'Hindi', value: 'hindi' },
    { title: 'Russian', value: 'russian' },
    { title: 'None', value: 'none' },
  ];

  function toggleCategory(value: string) {
    if (selectedCategories.includes(value)) {
      selectedCategories = selectedCategories.filter(c => c !== value);
    } else {
      selectedCategories = [...selectedCategories, value];
    }
    showCategoryOther = selectedCategories.includes('other');
  }

  function toggleLanguage(value: string) {
    if (selectedLanguages.includes(value)) {
      selectedLanguages = selectedLanguages.filter(l => l !== value);
    } else {
      selectedLanguages = [...selectedLanguages, value];
    }
  }
</script>


<SEO title="Submit | Public Shorts | Berlin" />


{#if unlocked}
<div class="max-w-4xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-8">Submit Your Film</h1>

  {#if form?.success}
    <div class="fixed bottom-6 right-6 bg-accent-500 p-4 rounded shadow-lg z-50 max-w-md">
      <p class="font-semibold">Submission successful! Thank you for submitting your film.</p>
    </div>
  {/if}

  {#if form?.error}
    <div class="fixed bottom-6 right-6 bg-accent-800 p-4 rounded shadow-lg z-50 max-w-md">
      <p class="font-semibold">Error: {form.error}</p>
    </div>
  {/if}

  <form
    action="?/submit"
    method="POST"
    enctype="multipart/form-data"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ update }) => {
        await update();
        isSubmitting = false;
      };
    }}
    class="space-y-8"
  >
    <!-- Contact Information -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold border-b border-gallery-300 pb-2">Contact Information</h2>

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
        <label for="email" class="block mb-2">
          Email <span class="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          bind:value={email}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        {#if form?.errors?.email}
          <p class="text-red-500 text-sm mt-1">{form.errors.email}</p>
        {/if}
      </div>

      <div>
        <label for="phone" class="block mb-2">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          bind:value={phone}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
      </div>

      <div>
        <label for="socialMedia" class="block mb-2">Social Media</label>
        <input
          type="text"
          id="socialMedia"
          name="socialMedia"
          bind:value={socialMedia}
          placeholder="Instagram, Twitter, etc."
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
      </div>

      <div>
        <label for="website" class="block mb-2">Website</label>
        <input
          type="url"
          id="website"
          name="website"
          bind:value={website}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
      </div>
    </section>

    <!-- Film Information -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold border-b border-gallery-300 pb-2">Film Information</h2>

      <div>
        <label for="directorName" class="block mb-2">
          Name of the Director <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="directorName"
          name="directorName"
          required
          bind:value={directorName}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        <p class="text-sm text-gallery-500 mt-1">The person who made the video. In case of multiple directors, use commas to separate</p>
        {#if form?.errors?.directorName}
          <p class="text-red-500 text-sm mt-1">{form.errors.directorName}</p>
        {/if}
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
          value={form?.originalTitle ?? ''}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        {#if form?.errors?.originalTitle}
          <p class="text-red-500 text-sm mt-1">{form.errors.originalTitle}</p>
        {/if}
      </div>

      <div>
        <label for="englishTitle" class="block mb-2">
          English Title <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="englishTitle"
          name="englishTitle"
          required
          value={form?.englishTitle ?? ''}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        {#if form?.errors?.englishTitle}
          <p class="text-red-500 text-sm mt-1">{form.errors.englishTitle}</p>
        {/if}
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="yearOfCompletion" class="block mb-2">
            Year of Completion <span class="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="yearOfCompletion"
            name="yearOfCompletion"
            required
            min="2023"
            max="2100"
            value={form?.yearOfCompletion ?? ''}
            class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
          />
          <p class="text-sm text-gallery-500 mt-1">Please note that submitted works must have been completed in 2023 or after.</p>
          {#if form?.errors?.yearOfCompletion}
            <p class="text-red-500 text-sm mt-1">{form.errors.yearOfCompletion}</p>
          {/if}
        </div>

        <div>
          <label for="length" class="block mb-2">
            Length (minutes) <span class="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="length"
            name="length"
            required
            min="1"
            max="15"
            value={form?.length ?? ''}
            class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
          />
          <p class="text-sm text-gallery-500 mt-1">Submitted works should be no longer than 15 minutes.</p>
          {#if form?.errors?.length}
            <p class="text-red-500 text-sm mt-1">{form.errors.length}</p>
          {/if}
        </div>
      </div>

      <div>
        <label class="block mb-2">
          Film Language(s) <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-gallery-50 border border-gallery-300 rounded">
          {#each LANGUAGES as language}
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLanguages.includes(language.value)}
                onchange={() => toggleLanguage(language.value)}
                class="cursor-pointer"
              />
              <span class="text-sm">{language.title}</span>
            </label>
          {/each}
        </div>
        <input type="hidden" name="filmLanguage" value={selectedLanguages.join(', ')} />
        {#if form?.errors?.filmLanguage}
          <p class="text-red-500 text-sm mt-1">{form.errors.filmLanguage}</p>
        {/if}
      </div>

      <div>
        <label for="synopsis" class="block mb-2">
          Short Synopsis <span class="text-red-500">*</span>
        </label>
        <textarea
          id="synopsis"
          name="synopsis"
          required
          value={form?.synopsis ?? ''}
          maxlength="800"
          rows="6"
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        ></textarea>
        <p class="text-sm text-gallery-500 mt-1">Up to 150 words, 800 characters with space</p>
        {#if form?.errors?.synopsis}
          <p class="text-red-500 text-sm mt-1">{form.errors.synopsis}</p>
        {/if}
      </div>

      <div>
        <label class="block mb-2">
          Categories <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-gallery-50 border border-gallery-300 rounded">
          {#each CATEGORIES as category}
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.value)}
                onchange={() => toggleCategory(category.value)}
                class="cursor-pointer"
              />
              <span class="text-sm">{category.title}</span>
            </label>
          {/each}
        </div>
        <p class="text-sm text-gallery-500 mt-1">Options: Documentary, Experimental, Animation, Narrative, LGBTQAI+, Other</p>
        <input type="hidden" name="categories" value={selectedCategories.join(', ')} />
        {#if form?.errors?.categories}
          <p class="text-red-500 text-sm mt-1">{form.errors.categories}</p>
        {/if}
      </div>

      {#if showCategoryOther}
        <div>
          <label for="categoryOther" class="block mb-2">Please specify other category</label>
          <input
            type="text"
            id="categoryOther"
            name="categoryOther"
            value={form?.categoryOther ?? ''}
            class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
          />
        </div>
      {/if}
    </section>

    <!-- Media Files -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold border-b border-gallery-300 pb-2">Media Files</h2>

      <div>
        <label for="linkToWatch" class="block mb-2">
          Link to Watch <span class="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="linkToWatch"
          name="linkToWatch"
          required
          value={form?.linkToWatch ?? ''}
          placeholder="https://vimeo.com/..."
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        <p class="text-sm text-gallery-500 mt-1">Needs to be accessible until the start of the festival</p>
        {#if form?.errors?.linkToWatch}
          <p class="text-red-500 text-sm mt-1">{form.errors.linkToWatch}</p>
        {/if}
      </div>

      <div>
        <label for="linkPassword" class="block mb-2">Link Password</label>
        <input
          type="text"
          id="linkPassword"
          name="linkPassword"
          value={form?.linkPassword ?? ''}
          placeholder="Password (if required)"
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        <p class="text-sm text-gallery-500 mt-1">If we need a password to see your video, add it here</p>
      </div>

      <div>
        <label for="linkToDownload" class="block mb-2">Link to Download <span class="text-red-500">*</span></label>
        <input
          type="url"
          id="linkToDownload"
          name="linkToDownload"
          required
          value={form?.linkToDownload ?? ''}
          placeholder="https://drive.google.com/..."
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        <p class="text-sm text-gallery-500 mt-1">So we can screen. Please provide a file with english subtitles.</p>
        {#if form?.errors?.linkToDownload}
          <p class="text-red-500 text-sm mt-1">{form.errors.linkToDownload}</p>
        {/if}
      </div>

      <div>
        <label for="screenshots" class="block mb-2">
          Screenshots <span class="text-red-500">*</span>
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
          <input
            type="file"
            id="screenshots"
            accept="image/*"
            multiple
            onchange={handleScreenshotsChange}
            class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded cursor-pointer hover:border-accent-500 transition-colors"
          />
        {/if}

        <p class="text-sm text-gallery-500 mt-1">Please attach up to 5 screenshots/film stills from your work. Drag to reorder.</p>
        {#if screenshotFiles.length === 0}
          <p class="text-red-500 text-sm mt-1">At least one screenshot is required</p>
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
                onclick={() => viewImage(posterFile.preview, posterFile.uploaded)}
                class="w-full aspect-[2/3] overflow-hidden rounded-t relative"
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
          <input
            type="file"
            id="poster"
            accept="image/*"
            onchange={handlePosterChange}
            class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded cursor-pointer hover:border-accent-500 transition-colors"
          />
        {/if}

        <p class="text-sm text-gallery-500 mt-1">Upload your film poster (JPG, PNG, etc.)</p>
        {#if form?.errors?.poster}
          <p class="text-red-500 text-sm mt-1">{form.errors.poster}</p>
        {/if}
      </div>
    </section>

    <!-- Credits -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold border-b border-gallery-300 pb-2">Credits</h2>

      <div>
        <label for="castAndCrew" class="block mb-2">Cast and Crew</label>
        <textarea
          id="castAndCrew"
          name="castAndCrew"
          value={form?.castAndCrew ?? ''}
          rows="6"
          placeholder="List your cast and crew members..."
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        ></textarea>
      </div>

      <div>
        <label for="thanks" class="block mb-2">Special Thanks</label>
        <textarea
          id="thanks"
          name="thanks"
          value={form?.thanks ?? ''}
          rows="4"
          placeholder="Acknowledgments and special thanks..."
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        ></textarea>
      </div>
    </section>

    <!-- Additional Information -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold border-b border-gallery-300 pb-2">Additional Information</h2>

      <div class="space-y-2">
        <label class="flex items-start">
          <input
            type="checkbox"
            name="explicit"
            value="true"
            class="mt-1 mr-2"
          />
          <span>
            This film contains explicit content
            <span class="block text-sm text-gallery-500 mt-1">
              We will be showing works across a kindergarten. Please indicate whether your work contains any of the following elements: Nudity, Sexual content, Blood/Violence, Epilepsi triggers, Strong language, Disturbing/triggering imagery
            </span>
          </span>
        </label>

        <div class="ml-6">
          <label for="explicitDetails" class="block mb-2 text-sm">
            What is explicit? <span class="text-red-500">*</span> (if checked above)
          </label>
          <textarea
            id="explicitDetails"
            name="explicitDetails"
            value={form?.explicitDetails ?? ''}
            rows="3"
            class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
          ></textarea>
          {#if form?.errors?.explicitDetails}
            <p class="text-red-500 text-sm mt-1">{form.errors.explicitDetails}</p>
          {/if}
        </div>
      </div>

      <div class="space-y-2">
        <label class="flex items-start">
          <input
            type="checkbox"
            name="aiUsed"
            value="true"
            class="mt-1 mr-2"
          />
          <span>
            AI was used in the creation of this film
            <span class="block text-sm text-gallery-500 mt-1">
              For transparency purposes, was AI used in any way for the making of this film?
            </span>
          </span>
        </label>

        <div class="ml-6">
          <label for="aiExplanation" class="block mb-2 text-sm">
            If yes, please tell us in a short text how AI was used:
          </label>
          <textarea
            id="aiExplanation"
            name="aiExplanation"
            value={form?.aiExplanation ?? ''}
            rows="3"
            class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
          ></textarea>
          {#if form?.errors?.aiExplanation}
            <p class="text-red-500 text-sm mt-1">{form.errors.aiExplanation}</p>
          {/if}
        </div>
      </div>

      <div class="space-y-2">
        <label class="flex items-start">
          <input
            type="checkbox"
            name="previousScreenings"
            value="true"
            class="mt-1 mr-2"
          />
          <span>
            This film has been screened previously
            <span class="block text-sm text-gallery-500 mt-1">
              Has the film been or will it be presented at other festivals?
            </span>
          </span>
        </label>

        <div class="ml-6">
          <label for="previousScreeningLocations" class="block mb-2 text-sm">
            Previous screening locations and year <span class="text-red-500">*</span> (if checked above)
          </label>
          <textarea
            id="previousScreeningLocations"
            name="previousScreeningLocations"
            value={form?.previousScreeningLocations ?? ''}
            rows="3"
            placeholder="Festival names, venues, dates..."
            class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
          ></textarea>
          {#if form?.errors?.previousScreeningLocations}
            <p class="text-red-500 text-sm mt-1">{form.errors.previousScreeningLocations}</p>
          {/if}
        </div>
      </div>

      <div>
        <label for="additionalInfo" class="block mb-2">Additional Information</label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          value={form?.additionalInfo ?? ''}
          rows="4"
          placeholder="Anything else that needs to be known about the creation process"
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        ></textarea>
      </div>

      <div>
        <label for="specialRequirements" class="block mb-2">Special Screening Requirements</label>
        <textarea
          id="specialRequirements"
          name="specialRequirements"
          value={form?.specialRequirements ?? ''}
          rows="3"
          placeholder="Please let us know if your work has any special technical or spatial requirements for presentation (e.g., multi-channel sound, specific volume levels, unusual aspect ratio, looping instructions, external files, physical objects)."
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        ></textarea>
      </div>
    </section>

    <!-- Terms and Conditions -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold border-b border-gallery-300 pb-2">Terms and Conditions</h2>

      <label class="flex items-start">
        <input
          type="checkbox"
          name="termsAccepted"
          required
          class="mt-1 mr-2"
        />
        <span>
          I accept the terms and conditions <span class="text-red-500">*</span>
          <span class="block text-sm text-gallery-500 mt-2">
            By checking this box, I confirm that:
          </span>
          <ul class="block text-sm text-gallery-500 mt-1 ml-4 list-disc space-y-1">
            <li>All information given above is correct</li>
            <li>I accept that the festival may use this information, including the screenshots, when promoting the festival, whether for non-commercial or commercial endeavors</li>
            <li>No copyrighted material has been used without proper authorization</li>
            <li>The festival has the right to show this work within the festival</li>
          </ul>
        </span>
      </label>
      {#if form?.errors?.termsAccepted}
        <p class="text-red-500 text-sm">{form.errors.termsAccepted}</p>
      {/if}
    </section>

    <!-- Submit Button -->
    <div class="pt-4">
      <button
        type="submit"
        disabled={isSubmitting}
        class="w-full bg-accent-500 hover:bg-accent-600 font-semibold py-3 px-6 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Film'}
      </button>
    </div>
  </form>
</div>
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
    role="dialog"
    aria-modal="true"
    aria-label="Image viewer"
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
    {/if}

    <div
      class="max-w-7xl max-h-full"
      onclick={(e) => e.stopPropagation()}
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
  </div>
{/if}


<style>
  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-accent-500);
  }
</style>
