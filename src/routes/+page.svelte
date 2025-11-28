<script>
	import Logo from '$lib/components/logo/logo.svelte';
	const images = [
		'/images/Pictures/window/window-pics-01.png',
		'/images/Pictures/window/window-pics-02.png',
		'/images/Pictures/window/window-pics-03.png',
		'/images/Pictures/window/window-pics-04.png',
		'/images/Pictures/window/window-pics-05.png'
	];

	let currentImageIndex = $state(0);
	const imagesCount = images.length;
</script>

<div class="relative flex h-full w-full flex-col items-center">
	<img src={images[currentImageIndex]} alt="Rotating festival" class="mb-8 max-h-[75dvh] w-auto" />
	<div class="asbsolute flex items-stretch">
		{#each images as item, index}
			<!-- content here -->
			<div
				class="h-full flex-1"
				role="button"
				tabindex="0"
				onmouseenter={() => (currentImageIndex = index)}
			></div>
		{/each}
	</div>
</div>
