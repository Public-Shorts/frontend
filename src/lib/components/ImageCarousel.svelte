<script lang="ts">
	import Icon from '@iconify/svelte';
	type Image = {
		src: string;
		alt?: string;
	};
	let { images }: { images: Array<Image> } = $props();
	let currentIndex = $state(0);
</script>

<div class="relative h-full w-full">
	{#each images as image, i}
		<button
			type="button"
			onclick={() => (currentIndex = (currentIndex - 1 + images.length) % images.length)}
			class="h-full w-full"
			class:hidden={i !== currentIndex}
			aria-label="Previous image"
		>
			<img
				src={image.src}
				alt={image.alt}
				class="h-full w-full object-cover transition-opacity duration-300"
			/>
		</button>
	{/each}
	{#if images.length > 1}
		<!-- content here -->

		<div class="absolute right-0 bottom-0 flex items-center justify-end gap-3 px-2 py-2">
			<button
				onclick={() => (currentIndex = (currentIndex - 1 + images.length) % images.length)}
				class="text-white/70 transition-colors hover:text-white"
				aria-label="Previous image"
			>
				<Icon icon="ri:arrow-left-line" width="20" />
			</button>

			<button
				onclick={() => (currentIndex = (currentIndex + 1) % images.length)}
				class="text-white/70 transition-colors hover:text-white"
				aria-label="Next image"
			>
				<Icon icon="ri:arrow-right-line" width="20" />
			</button>
		</div>
	{/if}
</div>
