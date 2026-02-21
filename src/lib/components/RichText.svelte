<script lang="ts">
	type Mark = {
		_type: string;
		_key: string;
		href?: string;
	};

	type Span = {
		_type: 'span';
		_key: string;
		text: string;
		marks: string[];
	};

	type Block = {
		_type: 'block';
		_key: string;
		style: string;
		children: Span[];
		markDefs: Mark[];
	};

	let { blocks, class: className = '' }: { blocks: Block[]; class?: string } = $props();
</script>

<div class={className}>
	{#each blocks as block (block._key)}
		{@const Tag = block.style === 'h3' ? 'h3' : 'p'}
		<svelte:element this={Tag} class={block.style === 'h3' ? 'rich-heading' : 'rich-paragraph'}>
			{#each block.children as span (span._key)}
				{@const link = span.marks.length > 0
					? block.markDefs?.find((m) => span.marks.includes(m._key) && m._type === 'link')
					: null}
				{@const isBold = span.marks.includes('strong')}
				{@const isItalic = span.marks.includes('em')}
				{#if link}
					<a
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						class="rich-link"
					>
						<span class:font-bold={isBold} class:italic={isItalic}>{span.text}</span>
					</a>
				{:else if isBold && isItalic}
					<strong><em>{span.text}</em></strong>
				{:else if isBold}
					<strong>{span.text}</strong>
				{:else if isItalic}
					<em>{span.text}</em>
				{:else}
					{span.text}
				{/if}
			{/each}
		</svelte:element>
	{/each}
</div>

<style>
	.rich-link {
		text-decoration: underline;
		text-underline-offset: 2px;
		color: inherit;
		transition: opacity 0.15s;
	}
	.rich-link:hover {
		opacity: 0.7;
	}
</style>
