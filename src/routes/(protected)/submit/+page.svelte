<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageProps, Snapshot } from './$types';

  let { data, form }: PageProps = $props();

  let i = $state(0)
  let unlocked = $derived(i > 7)
  let submitterName = $state("")
  let email = $state(form?.email ?? '')
  let phone = $state(form?.phone ?? '')
  let socialMedia = $state(form?.socialMedia ?? '')
  let website = $state(form?.website ?? '')
  let directorName = $state(form?.directorName ?? '')
  let screenshots = $state<FileList | null>(null);
  let poster = $state<FileList | null>(null);
  let selectedCategories = $state<string[]>(form?.categories?.split(',').map(c => c.trim()) ?? []);
  let selectedLanguages = $state<string[]>(form?.filmLanguage?.split(',').map(l => l.trim()) ?? []);
  let showCategoryOther = $state(selectedCategories.includes('other'));
  let isSubmitting = $state(false);
      
  const progress = () => i++

	export const snapshot: Snapshot<string> = {
		capture: () => {
      const all = {
        submitterName,
        email,
        phone,
        unlocked,
        selectedCategories,
        selectedLanguages,
        showCategoryOther,
        isSubmitting
      }
      console.log("capture ", all)
      return JSON.stringify(all)
    },
		restore: (value) => {
      const parsed = JSON.parse(value)

      unlocked = parsed.unlocked
      submitterName = parsed.submitterName
      email = parsed.email
      phone = parsed.phone
      // selectedCategories = parsed.selectedCategories
      // selectedLanguages = parsed.selectedLanguages
      // showCategoryOther = parsed.showCategoryOther
      // isSubmitting = parsed.isSubmitting
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
          value={directorName}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        <p class="text-sm text-gallery-500 mt-1">The person who made the video.</p>
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
        </label>
        <input
          type="file"
          id="screenshots"
          name="screenshots"
          accept="image/*"
          multiple
          required
          bind:files={screenshots}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
        <p class="text-sm text-gallery-500 mt-1">Please attach up to 5 screenshots/film stills from your work.</p>
        {#if form?.errors?.screenshots}
          <p class="text-red-500 text-sm mt-1">{form.errors.screenshots}</p>
        {/if}
      </div>

      <div>
        <label for="poster" class="block mb-2">Poster</label>
        <input
          type="file"
          id="poster"
          name="poster"
          accept="image/*"
          bind:files={poster}
          class="w-full p-2 bg-gallery-50 border border-gallery-300 rounded"
        />
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



<style>
  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-accent-500);
  }
</style>
