<!-- src/lib/components/Footer.svelte -->
<script>
	import Logo from '../logo/logo.svelte';

	const year = new Date().getFullYear();
</script>

<footer
	class="w-full border-t border-gallery-200 bg-gallery-50 pt-16 pb-12 text-sm text-gallery-600"
>
	<div class="mx-auto grid max-w-screen-xl grid-cols-1 gap-12 px-8 md:grid-cols-4">
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

		<!-- Column 2: Social / Network -->
		<div class="flex flex-col gap-4">
			<h4 class=" text-xs tracking-widest text-gallery-900 uppercase">Connect</h4>
			<div class="flex flex-col gap-2">
				<a href="https://instagram.com/public.shorts.festival" class="hover:text-gallery-900"
					>Instagram</a
				>
			</div>
		</div>

		<!-- Column 3: Legal / Meta -->
		<div class="flex flex-col gap-4">
			<h4 class=" text-xs tracking-widest text-gallery-900 uppercase">Legal</h4>
			<div class="flex flex-col gap-2">
				<a href="/impressum" class="hover:text-gallery-900">Impressum</a>
				<a href="/privacy" class="hover:text-gallery-900">Privacy Policy</a>
				<a href="/terms" class="hover:text-gallery-900">Terms of Service</a>
			</div>
		</div>

		<!-- Column 4: Newsletter (Simplified) -->
		<div class="flex flex-col gap-4">
			<h4 class=" text-xs tracking-widest text-gallery-900 uppercase">Updates</h4>
			<form class="flex flex-col gap-3">
				<label for="email" class="sr-only">Email Address</label>
				<div
					class="flex items-center gap-2 border-gallery-300 pb-2 transition-colors focus-within:border-gallery-900"
				>
					<input
						type="email"
						id="email"
						placeholder="email@domain.com"
						class="w-full bg-transparent text-gallery-900 placeholder-gallery-400 outline-none"
					/>
					<button
						type="submit"
						class="text-xs font-medium tracking-wider text-gallery-900 uppercase hover:text-accent-500"
					>
						→
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Bottom Bar -->
	<div class="mx-auto mt-16 flex max-w-screen-xl justify-between px-8 text-xs text-gallery-400">
		<span>© {year} Public Shorts. All rights reserved.</span>
		<span class="">Berlin, DE</span>
	</div>
</footer>

<style>
	a {
		text-decoration: none;
	}
</style>
