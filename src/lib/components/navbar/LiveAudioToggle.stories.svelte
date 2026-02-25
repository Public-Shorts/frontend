<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LiveAudioToggle from './LiveAudioToggle.svelte';

	const { Story } = defineMeta({
		title: 'Navbar/LiveAudioToggle',
		component: LiveAudioToggle,
	});
</script>

<Story name="Default">
	{#snippet template()}
		<div class="flex items-center gap-4 bg-gallery-50 p-4">
			<LiveAudioToggle />
		</div>
	{/snippet}
</Story>
