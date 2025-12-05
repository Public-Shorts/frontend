<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { ISO_LANGUAGES as LANGUAGES } from './languages';

	let { data, form }: PageProps = $props();

	let screenshots = $state<FileList | null>(null);
	let poster = $state<FileList | null>(null);
	let selectedCategories = $state<string[]>(
		form?.categories?.split(',').map((c) => c.trim()) ?? []
	);
	let selectedLanguages = $state<string[]>(
		form?.filmLanguage?.split(',').map((l) => l.trim()) ?? []
	);
	let showCategoryOther = $state(selectedCategories.includes('other'));
	let isSubmitting = $state(false);

	const CATEGORIES = [
		{ title: 'Documentary', value: 'documentary' },
		{ title: 'Experimental', value: 'experimental' },
		{ title: 'Animation', value: 'animation' },
		{ title: 'Narrative', value: 'narrative' },
		{ title: 'LGBTQAI+', value: 'lgbtqai' },
		{ title: 'Music Video', value: 'music_video' },
		{ title: 'Dance Film', value: 'dance' },
		{ title: 'Micro-Short', value: 'micro' },
		{ title: 'Urban / City', value: 'urban' },
		{ title: 'Environment / Nature', value: 'environment' },
		{ title: 'Social Impact / Activism', value: 'social_impact' },
		{ title: 'Mobile / Smartphone', value: 'mobile' },
		{ title: 'Silent / Visual-Only', value: 'silent_visual' },
		{ title: 'Performance', value: 'performance' },
		{ title: 'Comedy', value: 'comedy' },
		{ title: 'Horror', value: 'horror' },
		{ title: 'Science Fiction / Fantasy', value: 'sci_fi_fantasy' },
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

	function toggleLanguage(value: string) {
		if (selectedLanguages.includes(value && value !== '')) {
			selectedLanguages = selectedLanguages.filter((l) => l !== value);
		} else {
			selectedLanguages = [...selectedLanguages, value];
		}
	}
</script>

<div class="mx-auto max-w-4xl p-6">
	<h1 class="mb-8 text-3xl font-bold">Submit Your Film</h1>

	{#if form?.success}
		<div class="fixed right-6 bottom-6 z-50 max-w-md rounded bg-accent-500 p-4 shadow-lg">
			<p class="font-semibold">Submission successful! Thank you for submitting your film.</p>
		</div>
	{/if}

	{#if form?.error}
		<div class="fixed right-6 bottom-6 z-50 max-w-md rounded bg-accent-800 p-4 shadow-lg">
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
			<h2 class="border-b border-gallery-300 pb-2 text-2xl font-semibold">Contact Information</h2>

			<div>
				<label for="submitterName" class="mb-2 block">
					Name of the person submitting <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="submitterName"
					name="submitterName"
					required
					value={form?.submitterName ?? ''}
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				/>
				<p class="mt-1 text-sm text-gallery-500">
					This person is responsible for the accuracy of the information given in this form and
					shall be informed about the selection result.
				</p>
				{#if form?.errors?.submitterName}
					<p class="mt-1 text-sm text-red-500">{form.errors.submitterName}</p>
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
					value={form?.email ?? ''}
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
					value={form?.phone ?? ''}
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				/>
			</div>

			<div>
				<label for="socialMedia" class="mb-2 block">Social Media</label>
				<input
					type="text"
					id="socialMedia"
					name="socialMedia"
					value={form?.socialMedia ?? ''}
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
					value={form?.website ?? ''}
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				/>
			</div>
		</section>

		<!-- Film Information -->
		<section class="space-y-4">
			<h2 class="border-b border-gallery-300 pb-2 text-2xl font-semibold">Film Information</h2>

			<div>
				<label for="directorName" class="mb-2 block">
					Name of the Director(s) <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="directorName"
					name="directorName"
					required
					value={form?.directorName ?? ''}
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				/>
				<p class="mt-1 text-sm text-gallery-500">The person who made the video.</p>
				{#if form?.errors?.directorName}
					<p class="mt-1 text-sm text-red-500">{form.errors.directorName}</p>
				{/if}
			</div>

			<div>
				<label for="originalTitle" class="mb-2 block">
					Original Title <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="originalTitle"
					name="originalTitle"
					required
					value={form?.originalTitle ?? ''}
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				/>
				{#if form?.errors?.originalTitle}
					<p class="mt-1 text-sm text-red-500">{form.errors.originalTitle}</p>
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
					value={form?.englishTitle ?? ''}
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
						value={form?.yearOfCompletion ?? ''}
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
						value={form?.length ?? ''}
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
					<p class="mt-1 text-sm text-gallery-500">
						Submitted works should be no longer than 15 minutes.
					</p>
					{#if form?.errors?.length}
						<p class="mt-1 text-sm text-red-500">{form.errors.length}</p>
					{/if}
				</div>
			</div>

			<div>
				<label for="filmLanguage" class="mb-2 block">
					Film Language(s) <span class="text-red-500">*</span>
				</label>
				<select
					id="filmLanguage"
					name="filmLanguage"
					onchange={(e) => toggleLanguage((e.target as HTMLSelectElement).value)}
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				>
					<option value="">Select a language...</option>
					{#each LANGUAGES as language}
						<option value={language.value}>{language.title}</option>
					{/each}
				</select>
				<p class="mt-1 text-sm text-gallery-500">Click to select multiple languages</p>

				{#if selectedLanguages.length > 0}
					<div class="mt-2 flex flex-wrap gap-2">
						{#each selectedLanguages as lang}
							<span
								class="inline-flex items-center gap-1 rounded bg-accent-200 px-2 py-1 text-sm text-accent-500"
							>
								{LANGUAGES.find((l) => l.value === lang)?.title || lang}
								<button
									type="button"
									onclick={() => toggleLanguage(lang)}
									class="hover:text-accent-900"
								>
									×
								</button>
							</span>
						{/each}
					</div>
				{/if}

				<input type="hidden" name="filmLanguage" value={selectedLanguages.join(', ')} />
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
					value={form?.synopsis ?? ''}
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
				<label class="mb-2 block">
					Categories <span class="text-red-500">*</span>
				</label>
				<div
					class="grid grid-cols-2 gap-2 rounded border border-gallery-300 bg-gallery-50 p-3 md:grid-cols-3"
				>
					{#each CATEGORIES as category}
						<label class="flex cursor-pointer items-center space-x-2">
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
				<p class="mt-1 text-sm text-gallery-500">
					Please select all categories that apply to your film.
				</p>
				<input type="hidden" name="categories" value={selectedCategories.join(', ')} />
				{#if form?.errors?.categories}
					<p class="mt-1 text-sm text-red-500">{form.errors.categories}</p>
				{/if}
			</div>

			{#if showCategoryOther}
				<div>
					<label for="categoryOther" class="mb-2 block">Please specify other category</label>
					<input
						type="text"
						id="categoryOther"
						name="categoryOther"
						value={form?.categoryOther ?? ''}
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					/>
				</div>
			{/if}
		</section>

		<!-- Media Files -->
		<section class="space-y-4">
			<h2 class="border-b border-gallery-300 pb-2 text-2xl font-semibold">Media Files</h2>

			<div>
				<label for="linkToWatch" class="mb-2 block">
					Link to Watch <span class="text-red-500">*</span>
				</label>
				<input
					type="url"
					id="linkToWatch"
					name="linkToWatch"
					required
					value={form?.linkToWatch ?? ''}
					placeholder="https://vimeo.com/..."
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				/>
				<p class="mt-1 text-sm text-gallery-500">
					Needs to be accessible until the start of the festival
				</p>
				{#if form?.errors?.linkToWatch}
					<p class="mt-1 text-sm text-red-500">{form.errors.linkToWatch}</p>
				{/if}
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
					value={form?.linkToDownload ?? ''}
					placeholder="https://drive.google.com/..."
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				/>
				<p class="mt-1 text-sm text-gallery-500">Please provide a file with English subtitles.</p>
				{#if form?.errors?.linkToDownload}
					<p class="mt-1 text-sm text-red-500">{form.errors.linkToDownload}</p>
				{/if}
			</div>

			<div>
				<label for="screenshots" class="mb-2 block">
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
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				/>
				<p class="mt-1 text-sm text-gallery-500">
					Please attach up to 5 screenshots/film stills from your work.
				</p>
				{#if form?.errors?.screenshots}
					<p class="mt-1 text-sm text-red-500">{form.errors.screenshots}</p>
				{/if}
			</div>

			<div>
				<label for="poster" class="mb-2 block">Poster</label>
				<input
					type="file"
					id="poster"
					name="poster"
					accept="image/*"
					bind:files={poster}
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				/>
				<p class="mt-1 text-sm text-gallery-500">Upload your film poster (JPG, PNG, etc.)</p>
				{#if form?.errors?.poster}
					<p class="mt-1 text-sm text-red-500">{form.errors.poster}</p>
				{/if}
			</div>
		</section>

		<!-- Credits -->
		<section class="space-y-4">
			<h2 class="border-b border-gallery-300 pb-2 text-2xl font-semibold">Credits</h2>

			<div>
				<label for="castAndCrew" class="mb-2 block">Cast and Crew</label>
				<textarea
					id="castAndCrew"
					name="castAndCrew"
					value={form?.castAndCrew ?? ''}
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
					value={form?.thanks ?? ''}
					rows="4"
					placeholder="Acknowledgments and thanks..."
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				></textarea>
			</div>
		</section>

		<!-- Additional Information -->
		<section class="space-y-4">
			<h2 class="border-b border-gallery-300 pb-2 text-2xl font-semibold">
				Additional Information
			</h2>

			<div class="space-y-2">
				<label class="flex items-start">
					<input type="checkbox" name="explicit" value="true" class="mt-1 mr-2" />
					<span>
						This film contains explicit content
						<span class="mt-1 block text-sm text-gallery-500">
							We will be showing works across a kindergarten. Please indicate whether your work
							contains any of the following elements: Nudity, Sexual content, Blood/Violence,
							Epilepsi triggers, Strong language, Disturbing/triggering imagery.
						</span>
					</span>
				</label>

				<div class="ml-6">
					<label for="explicitDetails" class="mb-2 block text-sm">
						What is explicit? <span class="text-red-500">*</span> (if checked above)
					</label>
					<textarea
						id="explicitDetails"
						name="explicitDetails"
						value={form?.explicitDetails ?? ''}
						rows="3"
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					></textarea>
					{#if form?.errors?.explicitDetails}
						<p class="mt-1 text-sm text-red-500">{form.errors.explicitDetails}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-2">
				<label class="flex items-start">
					<input type="checkbox" name="aiUsed" value="true" class="mt-1 mr-2" />
					<span>
						AI was used in the creation of this film
						<span class="mt-1 block text-sm text-gallery-500">
							For transparency purposes, was AI used in any way for the making of this film?
						</span>
					</span>
				</label>

				<div class="ml-6">
					<label for="aiExplanation" class="mb-2 block text-sm">
						If yes, please tell us in a short text how AI was used:
					</label>
					<textarea
						id="aiExplanation"
						name="aiExplanation"
						value={form?.aiExplanation ?? ''}
						rows="3"
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					></textarea>
					{#if form?.errors?.aiExplanation}
						<p class="mt-1 text-sm text-red-500">{form.errors.aiExplanation}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-2">
				<label class="flex items-start">
					<input type="checkbox" name="previousScreenings" value="true" class="mt-1 mr-2" />
					<span>
						This film has been screened previously
						<span class="mt-1 block text-sm text-gallery-500">
							Has the film been or will it be presented at other festivals?
						</span>
					</span>
				</label>

				<div class="ml-6">
					<label for="previousScreeningLocations" class="mb-2 block text-sm">
						Previous screening locations and year <span class="text-red-500">*</span> (if checked above)
					</label>
					<textarea
						id="previousScreeningLocations"
						name="previousScreeningLocations"
						value={form?.previousScreeningLocations ?? ''}
						rows="3"
						placeholder="Festival names, venues, dates..."
						class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
					></textarea>
					{#if form?.errors?.previousScreeningLocations}
						<p class="mt-1 text-sm text-red-500">{form.errors.previousScreeningLocations}</p>
					{/if}
				</div>
			</div>

			<div>
				<label for="additionalInfo" class="mb-2 block">Additional Information</label>
				<textarea
					id="additionalInfo"
					name="additionalInfo"
					value={form?.additionalInfo ?? ''}
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
					value={form?.specialRequirements ?? ''}
					rows="3"
					placeholder="Please let us know if your work has any special technical or spatial requirements for presentation (e.g., multi-channel sound, specific volume levels, unusual aspect ratio, looping instructions, external files, physical objects)."
					class="w-full rounded border border-gallery-300 bg-gallery-50 p-2"
				></textarea>
			</div>
		</section>

		<!-- Terms and Conditions -->
		<section class="space-y-4">
			<h2 class="border-b border-gallery-300 pb-2 text-2xl font-semibold">Terms and Conditions</h2>

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
		<div class="pt-4">
			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full cursor-pointer rounded-lg bg-accent-500 px-8 py-4 font-semibold text-white transition-all hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? 'Submitting...' : 'Submit Film'}
			</button>
		</div>
	</form>
</div>

<style>
	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-accent-500);
	}
</style>
