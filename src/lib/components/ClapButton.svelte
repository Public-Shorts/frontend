<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';

	type Props = {
		filmId: string;
		totalClaps: number;
		disabled?: boolean;
		showLabel?: boolean;
	};

	let { filmId, totalClaps, disabled = false, showLabel = false }: Props = $props();

	let sessionClaps = $state(0);
	let animating = $state(false);
	let holdInterval: ReturnType<typeof setInterval> | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingDelta = 0;

	// Restore session claps from sessionStorage
	$effect(() => {
		if (browser) {
			const stored = sessionStorage.getItem(`claps-${filmId}`);
			if (stored) sessionClaps = parseInt(stored, 10) || 0;
		}
	});

	function getSessionId(): string {
		if (!browser) return '';
		let id = sessionStorage.getItem('audience-session-id');
		if (!id) {
			id = crypto.randomUUID();
			sessionStorage.setItem('audience-session-id', id);
		}
		return id;
	}

	function incrementClap() {
		if (disabled) return;
		sessionClaps++;
		pendingDelta++;
		if (browser) sessionStorage.setItem(`claps-${filmId}`, String(sessionClaps));

		// Trigger animation
		animating = true;
		setTimeout(() => (animating = false), 150);

		// Debounced POST
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(flushClaps, 800);
	}

	async function flushClaps() {
		if (pendingDelta <= 0) return;
		const delta = pendingDelta;
		pendingDelta = 0;
		const sessionId = getSessionId();

		try {
			const res = await fetch('/api/clap', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filmId, count: sessionClaps, sessionId })
			});
			if (!res.ok) {
				// Revert on error
				sessionClaps -= delta;
				pendingDelta += delta;
				if (browser) sessionStorage.setItem(`claps-${filmId}`, String(sessionClaps));
			}
		} catch {
			sessionClaps -= delta;
			pendingDelta += delta;
			if (browser) sessionStorage.setItem(`claps-${filmId}`, String(sessionClaps));
		}
	}

	function onPointerDown(e: PointerEvent) {
		if (disabled) return;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		incrementClap();
		holdInterval = setInterval(incrementClap, 150);
	}

	function onPointerUp() {
		if (holdInterval) {
			clearInterval(holdInterval);
			holdInterval = null;
		}
	}

	// Display count: prefer live totalClaps, but show optimistic local if higher
	const displayCount = $derived(Math.max(totalClaps, sessionClaps));
</script>

<button
	class="clap-btn group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors
		{disabled
		? 'cursor-default text-gallery-400'
		: 'cursor-pointer text-gallery-600 hover:bg-accent-50 hover:text-accent-600 active:bg-accent-100'}"
	{disabled}
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
	onpointerleave={onPointerUp}
	onpointercancel={onPointerUp}
>
	<span
		class="inline-block transition-transform duration-150"
		class:scale-125={animating}
	>
		<Icon icon="ri:hand-heart-line" width="20" />
	</span>
	{#if showLabel}<span>Clap</span>{/if}
	<span class="tabular-nums font-medium transition-transform duration-150" class:scale-110={animating}>
		{displayCount}
	</span>
</button>

<style>
	.clap-btn {
		-webkit-user-select: none;
		user-select: none;
		touch-action: manipulation;
	}
</style>
