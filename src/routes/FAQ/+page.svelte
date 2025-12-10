<script lang="ts">
	import GridLayout from '../../lib/components/GridLayout.svelte';
</script>

<GridLayout>
	<h1 class="mb-4 text-3xl font-bold md:col-span-5 md:col-start-2">FAQ</h1>
	<div class=" md:col-span-5 md:col-start-2">
		<details class="mb-4">
			<summary class="cursor-pointer font-semibold">Can I submit multiple videos?</summary>
			<p class="mt-2 pl-4">
				No. You can only submit one solo video. If you also worked on a different video as part of a
				group, that group video can be submitted separately.
			</p>
		</details>

		<details class="mb-4">
			<summary class="cursor-pointer font-semibold">What are the requirements for videos?</summary>
			<ul class="mt-2 list-disc space-y-1 pl-8">
				<li>Maximum length: under 15 minutes.</li>
				<li>Produced within the last 3 years.</li>
				<li>
					Any format of short video (film, documentary, animation, experimental, etc.) is welcome.
				</li>
			</ul>
		</details>

		<details class="mb-4">
			<summary class="cursor-pointer font-semibold">Is it paid?</summary>
			<p class="mt-2 pl-4">
				No, there is no payment or screening fee; the festival is organised by volunteers as a
				community project.
			</p>
		</details>

		<details class="mb-4">
			<summary class="cursor-pointer font-semibold">Who can submit?</summary>
			<p class="mt-2 pl-4">Everyone can submit: including professionals, students, and amateurs.</p>
		</details>
		<details class="mb-4">
			<summary class="cursor-pointer font-semibold">How do I know I got selected?</summary>
			<p class="mt-2 pl-4">
				Submissions will be review in January and Feruary 2026. We will contact you afterwards.
			</p>
		</details>
	</div>
</GridLayout>
