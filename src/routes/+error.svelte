<script lang="ts">
	import { page } from '$app/state';
</script>

<h1
	class="flex h-[80dvh] w-full items-center justify-center pt-12 font-PPMori text-2xl text-gallery-500 uppercase"
>
	<p class="block">
		{page?.error?.message ?? 'An unexpected error occurred.'} :(
	</p>
</h1>
