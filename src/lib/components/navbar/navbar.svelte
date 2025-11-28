<script>
	import Logo from '../logo/logo.svelte';
</script>

<div
	class="flex w-full items-center justify-between border-b border-gallery-200 bg-gallery-50 p-4 pr-8"
>
	<a href="/" class="mb-2 w-32 fill-gallery-900">
		<Logo />
	</a>
	<div class="flex gap-8">
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
			<a
				class="bold text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="https://paypal.me/publicshorts">Support</a
			>
			<a
				class="bold border-b-2 border-accent-500 text-gallery-700 transition-all duration-150 hover:text-gallery-400"
				href="/about">Submit</a
			>
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
