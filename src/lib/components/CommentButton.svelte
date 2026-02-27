<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';

	type Props = {
		filmId: string;
		showLabel?: boolean;
	};

	let { filmId, showLabel = false }: Props = $props();

	let open = $state(false);
	let text = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let errorMsg = $state('');

	// Check if already submitted for this film
	$effect(() => {
		if (browser) {
			const submittedFilms = JSON.parse(sessionStorage.getItem('commented-films') || '[]');
			if (submittedFilms.includes(filmId)) submitted = true;
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

	async function handleSubmit() {
		if (submitting || submitted || text.trim().length === 0) return;
		submitting = true;
		errorMsg = '';

		try {
			const res = await fetch('/api/comment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					filmId,
					text: text.trim(),
					sessionId: getSessionId()
				})
			});

			if (res.ok) {
				submitted = true;
				open = false;
				if (browser) {
					const submittedFilms = JSON.parse(sessionStorage.getItem('commented-films') || '[]');
					submittedFilms.push(filmId);
					sessionStorage.setItem('commented-films', JSON.stringify(submittedFilms));
				}
			} else {
				const data = await res.json().catch(() => null);
				errorMsg = data?.message || 'Failed to submit comment';
			}
		} catch {
			errorMsg = 'Network error. Please try again.';
		} finally {
			submitting = false;
		}
	}

	const charCount = $derived(text.length);
</script>

{#if submitted}
	<span class="flex items-center gap-1.5 text-sm text-gallery-500">
		<Icon icon="ri:check-line" width="18" />
		{#if showLabel}<span>Sent</span>{/if}
	</span>
{:else}
	<button
		class="flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-gallery-500 transition-colors hover:bg-gallery-100 hover:text-gallery-700"
		onclick={() => (open = !open)}
	>
		<Icon icon="ri:chat-3-line" width="18" />
		{#if showLabel}<span>Comment</span>{/if}
	</button>
{/if}

{#if open && !submitted}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center"
		onkeydown={(e) => { if (e.key === 'Escape') open = false; }}
		onclick={(e) => { if (e.target === e.currentTarget) open = false; }}
		role="dialog"
	>
		<div class="w-full max-w-md rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl">
			<p class="mb-3 text-sm text-gallery-500">
				Your anonymous feedback helps our curatorial team
			</p>

			<textarea
				bind:value={text}
				maxlength={300}
				rows={3}
				placeholder="Share your thoughts on this film..."
				class="w-full resize-none rounded border border-gallery-200 p-3 text-sm text-gallery-800 outline-none transition-colors focus:border-accent-400"
			></textarea>

			<div class="mt-2 flex items-center justify-between">
				<span class="text-xs text-gallery-400">{charCount}/300</span>

				<div class="flex gap-2">
					<button
						onclick={() => (open = false)}
						class="cursor-pointer rounded px-3 py-1.5 text-sm text-gallery-500 transition-colors hover:text-gallery-700"
					>
						Cancel
					</button>
					<button
						onclick={handleSubmit}
						disabled={submitting || text.trim().length === 0}
						class="cursor-pointer rounded bg-gallery-900 px-4 py-1.5 text-sm text-white transition-colors hover:bg-gallery-800 disabled:cursor-default disabled:opacity-40"
					>
						{submitting ? 'Sending...' : 'Send'}
					</button>
				</div>
			</div>

			{#if errorMsg}
				<p class="mt-2 text-xs text-red-600">{errorMsg}</p>
			{/if}
		</div>
	</div>
{/if}
