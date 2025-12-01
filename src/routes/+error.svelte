<script lang="ts">
	import { page } from '$app/state';
</script>

<h1 class="text- flex items-center justify-center">
	<p>
		{page?.error?.message ?? 'An unexpected error occurred.'}
	</p>
</h1>
