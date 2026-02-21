<script lang="ts">
	import { onDestroy } from 'svelte';
	import { env } from '$env/dynamic/public';
	import GridLayout from '$lib/components/GridLayout.svelte';
	import { createJanusStream, type StreamStatus, type JanusStream } from '$lib/janus-stream';

	const SERVER = 'wss://janus.enabler.space/janus';
	const STREAM_ID = env.PUBLIC_JANUS_STREAM_ID ? Number(env.PUBLIC_JANUS_STREAM_ID) : 10;

	let status = $state<StreamStatus>('idle');
	let statusDetail = $state('');
	let audioEl = $state<HTMLAudioElement>();
	let stream: JanusStream | null = null;

	function handleStatus(s: StreamStatus, detail?: string) {
		status = s;
		statusDetail = detail ?? '';
	}

	function connect() {
		if (!audioEl) return;
		stream = createJanusStream(SERVER, audioEl, handleStatus, STREAM_ID);
		stream.connect();
	}

	function disconnect() {
		stream?.disconnect();
		stream = null;
	}

	onDestroy(() => {
		stream?.destroy();
	});

	const isConnected = $derived(status === 'connected' || status === 'connecting');

	const statusLabel: Record<StreamStatus, string> = {
		idle: 'Ready',
		connecting: 'Connecting…',
		connected: 'Live',
		stopped: 'Stopped',
		error: 'Error'
	};
</script>

<svelte:head>
	<title>Live Audio</title>
</svelte:head>

<GridLayout>
	<h1 class="text-3xl font-bold md:col-span-5 md:col-start-2">Live Audio</h1>

	<div class="font-semibold md:col-span-1">Stream</div>
	<div class="flex flex-col gap-4 md:col-span-3">
		<div class="flex items-center gap-3">
			<span
				class="inline-block h-2.5 w-2.5 rounded-full {status === 'connected'
					? 'bg-green-500'
					: status === 'connecting'
						? 'bg-amber-400 animate-pulse'
						: status === 'error'
							? 'bg-red-500'
							: 'bg-gallery-400'}"
			></span>
			<span class="text-gallery-600">
				{statusLabel[status]}{statusDetail ? `: ${statusDetail}` : ''}
			</span>
		</div>

		<div>
			{#if isConnected}
				<button
					onclick={disconnect}
					class="rounded-md bg-gallery-800 px-5 py-2 text-sm font-medium text-gallery-50 transition-colors hover:bg-gallery-900"
				>
					Disconnect
				</button>
			{:else}
				<button
					onclick={connect}
					class="rounded-md bg-accent-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
				>
					Connect
				</button>
			{/if}
		</div>

		<audio bind:this={audioEl} class="hidden"></audio>
	</div>
	<div class="hidden md:col-span-2 md:block"></div>
</GridLayout>
