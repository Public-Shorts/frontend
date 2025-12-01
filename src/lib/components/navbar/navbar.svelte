<script>
	import Logo from '../logo/logo.svelte';

	let open = false;
</script>

<div
	class="flex w-full items-center justify-between border-b border-gallery-200 bg-gallery-50 p-4 pr-8"
>
	<a href="/" class="mb-2 w-28 fill-gallery-800">
		<Logo />
	</a>

	<!-- Hamburger on mobile -->
	<button
		class="flex flex-col gap-2 md:hidden"
		aria-label="Toggle navigation"
		on:click={() => (open = !open)}
	>
		<div class="h-1 w-12 bg-gallery-800"></div>
		<div class="h-1 w-12 bg-gallery-800"></div>
		<div class="h-1 w-12 bg-gallery-800"></div>
	</button>

	<!-- Desktop nav -->
	<div class="hidden gap-8 md:flex">
		<div class="flex gap-4">
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
			<div class="">
				<a class=" bold text-gallery-400" href="/submit">Open Call</a>
			</div>
		</div>
		<div class="flex gap-2">
			<a class="bold text-gallery-400 transition-all duration-150 hover:text-gallery-400" href=""
				>EN</a
			>
			<p class="text-gallery-200">|</p>
			<a class="bold text-gallery-700 transition-all duration-150 hover:text-gallery-400" href=""
				>DE</a
			>
		</div>
	</div>
</div>

<!-- Mobile dropdown -->
{#if open}
	<nav
		class="flex flex-col gap-8 border-b border-gallery-200 bg-gallery-50 px-8 py-16 pb-4 text-2xl md:hidden"
	>
		<a class="bold text-gallery-700" href="/festival">Festival</a>
		<a class="bold text-gallery-700" href="/programme">Programme</a>
		<a class="bold text-gallery-700" href="/events">Events</a>
		<a class="bold text-gallery-700" href="/partners">Partners</a>
		<a class="bold text-gallery-700" href="/press">Press</a>
		<a class="bold text-gallery-700" href="https://paypal.me/publicshorts">Support</a>
		<span class="relative">
			<a class="bold text-gallery-400" href="/submit">Submit</a>
			<p class="inline align-text-top text-xs text-accent-500">open soon!</p>
		</span>

		<div class="flex gap-2 pt-2">
			<a class="bold text-gallery-400" href="">EN</a>
			<p class="text-gallery-200">|</p>
			<a class="bold text-gallery-700" href="">DE</a>
		</div>
	</nav>
{/if}

<style>
	a {
		text-decoration: none;
	}
</style>
