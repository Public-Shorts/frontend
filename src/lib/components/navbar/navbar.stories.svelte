<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Navbar from './navbar.svelte';

	const { Story } = defineMeta({
		title: 'Navbar/Navbar',
		component: Navbar,
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Navbar />
	{/snippet}
</Story>

<Story name="WithAudioToggle">
	{#snippet template()}
		<Navbar isDev={true} />
	{/snippet}
</Story>

<Story name="DuringFestival">
	{#snippet template()}
		<Navbar scheduleDateStart="2025-01-01" scheduleDateEnd="2027-12-31" />
	{/snippet}
</Story>
