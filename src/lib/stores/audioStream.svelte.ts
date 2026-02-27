import { browser } from '$app/environment';
import { createJanusStream, type StreamStatus, type JanusStream } from '$lib/janus-stream';
import { env } from '$env/dynamic/public';

const SERVER = 'wss://janus.enabler.space/janus';
const STREAM_ID = env.PUBLIC_JANUS_STREAM_ID ? Number(env.PUBLIC_JANUS_STREAM_ID) : 10;

// Module-level reactive state (singleton)
let status = $state<StreamStatus>('idle');
let audioEl: HTMLAudioElement | null = null;
let stream: JanusStream | null = null;

function ensureAudioEl() {
	if (!browser) return null;
	if (!audioEl) {
		audioEl = document.createElement('audio');
		audioEl.style.display = 'none';
		document.body.appendChild(audioEl);
	}
	return audioEl;
}

function connect() {
	const el = ensureAudioEl();
	if (!el) return;
	if (status === 'connected' || status === 'connecting') return;
	stream = createJanusStream(
		SERVER,
		el,
		(s) => {
			status = s;
		},
		STREAM_ID
	);
	stream.connect();
}

function disconnect() {
	stream?.disconnect();
	stream = null;
}

function toggle() {
	if (status === 'connected' || status === 'connecting') disconnect();
	else connect();
}

function destroy() {
	stream?.destroy();
	stream = null;
	if (audioEl) {
		audioEl.remove();
		audioEl = null;
	}
}

export function getAudioStream() {
	return {
		get status() {
			return status;
		},
		connect,
		disconnect,
		toggle,
		destroy
	};
}
