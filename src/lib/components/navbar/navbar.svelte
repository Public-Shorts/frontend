<script>
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import Icon from '@iconify/svelte';
	import Logo from '../logo/logo.svelte';

	let open = false;
</script>

<nav
	class=" flex w-full items-center justify-center border-b border-gallery-200 bg-gallery-50 py-12"
>
	<a href="/" class="absolute left-4 w-28 fill-gallery-800">
		<Logo />
	</a>
	<section
		class="hidden w-full max-w-5xl grid-cols-1 gap-6 gap-y-10 text-base sm:grid-cols-6 lg:grid"
	>
		<div class="col-span-4 col-start-2 flex gap-10">
			<a
				class="bold text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/festival">Festival</a
			>
			<a
				class="bold text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/programme">Programme</a
			>
			<a
				class="bold text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/events">Events</a
			>
			<a
				class="bold text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/partners">Partners</a
			>
			<a
				class="bold text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/press">Press</a
			>

			<a class=" bold text-gallery-400" href="/opencall">Open Call</a>
		</div>
	</section>
	<div class="absolute right-4 hidden gap-2 lg:flex">
		<LanguageSwitcher />
	</div>
	<button
		class="absolute right-4 flex flex-col gap-2 lg:hidden"
		aria-label="Toggle navigation"
		on:click={() => (open = !open)}
	>
		<Icon icon="material-symbols:menu" width="64" />
	</button>
</nav>

{#if open}
	<nav
		class="flex flex-col gap-8 border-b border-gallery-200 bg-gallery-50 px-8 py-16 pb-4 text-2xl lg:hidden"
	>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/festival">Festival</a>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/programme">Programme</a>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/events">Events</a>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/partners">Partners</a>
		<a on:click={() => (open = !open)} class="bold text-gallery-700" href="/press">Press</a>
		<a
			on:click={() => (open = !open)}
			class="bold text-gallery-700"
			href="https://paypal.me/publicshorts">Support</a
		>
		<span class="relative">
			<a class="bold text-gallery-400" href="/submit">Submit</a>
			<p class="inline align-text-top text-xs text-accent-500">open soon!</p>
		</span>

		<LanguageSwitcher />
	</nav>
{/if}

<style>
	a {
		text-decoration: none;
	}
</style>
