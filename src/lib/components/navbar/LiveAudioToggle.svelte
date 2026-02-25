<script lang="ts">
	import { onDestroy } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { createJanusStream, type StreamStatus, type JanusStream } from '$lib/janus-stream';

	const SERVER = 'wss://janus.enabler.space/janus';
	const STREAM_ID = env.PUBLIC_JANUS_STREAM_ID ? Number(env.PUBLIC_JANUS_STREAM_ID) : 10;

	let status = $state<StreamStatus>('idle');
	let audioEl = $state<HTMLAudioElement>();
	let stream: JanusStream | null = null;

	function handleStatus(s: StreamStatus, detail?: string) {
		status = s;
	}

	function toggle() {
		if (!audioEl) return;
		if (status === 'connected' || status === 'connecting') {
			stream?.disconnect();
			stream = null;
		} else {
			stream = createJanusStream(SERVER, audioEl, handleStatus, STREAM_ID);
			stream.connect();
		}
	}

	onDestroy(() => {
		stream?.destroy();
	});

	const dotColor = $derived(
		status === 'connected'
			? 'bg-green-500'
			: status === 'connecting'
				? 'bg-amber-400 animate-pulse'
				: status === 'error'
					? 'bg-red-500'
					: 'bg-gallery-400'
	);

	const label = $derived(
		status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Listen'
	);
</script>

<button
	onclick={toggle}
	class="flex items-center gap-1.5 text-sm text-gallery-600 transition-colors hover:text-gallery-900"
	aria-label={status === 'connected' || status === 'connecting' ? 'Disconnect live audio' : 'Connect live audio'}
>
	<span class="inline-block h-2 w-2 rounded-full {dotColor}"></span>
	<span>{label}</span>
</button>

<audio bind:this={audioEl} class="hidden"></audio>
