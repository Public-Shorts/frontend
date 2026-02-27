<script lang="ts">
	import { getAudioStream } from '$lib/stores/audioStream.svelte';

	const audio = getAudioStream();

	const dotColor = $derived(
		audio.status === 'connected'
			? 'bg-green-500'
			: audio.status === 'connecting'
				? 'bg-amber-400 animate-pulse'
				: audio.status === 'error'
					? 'bg-red-500'
					: 'bg-gallery-400'
	);

	const label = $derived(
		audio.status === 'connected' ? 'LIVE' : audio.status === 'connecting' ? 'Connecting' : 'Tune in'
	);
</script>

<button
	onclick={audio.toggle}
	class="flex items-center gap-2 text-base text-gallery-600 transition-colors hover:text-gallery-900"
	aria-label={audio.status === 'connected' || audio.status === 'connecting'
		? 'Disconnect live audio'
		: 'Connect live audio'}
>
	<span>{label}</span>
	<span class="inline-block h-3 w-3 rounded-full {dotColor}"></span>
</button>
