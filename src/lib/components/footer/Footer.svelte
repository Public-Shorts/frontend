<!-- src/lib/components/Footer.svelte -->
<script>
	import Logo from '../logo/logo.svelte';

	let {
		instagramUrl = 'https://instagram.com/public.shorts.festival',
		location = 'Berlin, DE'
	} = $props();

	const year = new Date().getFullYear();
</script>

<footer
	class="w-full border-t border-gallery-200 bg-gallery-50 pt-16 pb-12 text-sm text-gallery-600"
>
	<div class="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 md:grid-cols-4">
		<!-- Column 1: Identity -->
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-4 fill-gallery-400 leading-relaxed text-gallery-400">
				<div class="w-32">
					<Logo></Logo>
				</div>
				<div>
					<p>24/7 Video Festival</p>
				</div>
			</div>
		</div>

		<!-- Column 2: Info -->
		<div class="flex flex-col gap-4">
			<h4 class="text-xs tracking-widest text-gallery-900 uppercase">Info</h4>
			<div class="flex flex-col gap-2">
				<a href="/how-to-get-there" class="hover:text-gallery-900"> How to get there </a>
				<a href="/FAQ" class="hover:text-gallery-900"> FAQ </a>
				<a href="https://paypal.me/publicshorts" class="hover:text-gallery-900"> Donate </a>
			</div>
		</div>

		<!-- Column 3: Connect -->
		<div class="flex flex-col gap-4">
			<h4 class="text-xs tracking-widest text-gallery-900 uppercase">Connect</h4>
			<div class="flex flex-col gap-3">
				<a href="/contact" class="hover:text-gallery-900"> Contact </a>
				<a href={instagramUrl} class="text hover:text-gallery-900">
					Instagram
				</a>
			</div>
		</div>

		<!-- Column 4: Legal -->
		<div class="flex flex-col gap-4">
			<h4 class="text-xs tracking-widest text-gallery-900 uppercase">Legal</h4>
			<div class="flex flex-col gap-2">
				<a href="/impressum" class="hover:text-gallery-900"> Impressum </a>
				<a href="/terms-of-service" class="hover:text-gallery-900"> Terms of Service </a>
			</div>
		</div>
	</div>

	<!-- Bottom Bar -->
	<div class="mx-auto mt-16 flex max-w-7xl justify-between px-8 text-xs text-gallery-400">
		<span>© {year} Public Shorts. All rights reserved.</span>
		<span class="">{location}</span>
	</div>
</footer>

<style>
	a {
		text-decoration: none;
	}
</style>
