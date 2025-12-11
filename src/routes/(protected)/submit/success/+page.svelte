<script lang="ts">
  import SimpleImage from '$lib/sanity/SimpleImage.svelte';
  import SEO from "$lib/components/SEO.svelte";
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<SEO title="Submission Success | Public Shorts | Berlin" />

<div class="min-h-screen flex items-center justify-center px-6 py-20">
  <div class="max-w-2xl w-full text-center space-y-8">
    <h1 class="text-4xl md:text-5xl font-bold">Thank You!</h1>

    <p class="text-xl text-gallery-600">
      Your film has been successfully submitted to Public Shorts.
    </p>

    {#if data.poster}
      <div class="max-w-md mx-auto">
        <SimpleImage
          asset={data.poster}
          alt={data.title}
          width={600}
          class="w-full rounded-lg shadow-lg"
        />
      </div>
    {/if}

    {#if data.title}
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">{data.title}</h2>
        {#if data.director}
          <p class="text-lg text-gallery-600">Directed by {data.director}</p>
        {/if}
      </div>
    {/if}

    <div class="pt-8 space-y-4">
      <p class="text-gallery-600">
        We've received your submission and will review it shortly. You'll hear from us via email at <strong>{data.email}</strong>.
      </p>

      <div class="pt-4">
        <a
          href="/"
          class="inline-block bg-accent-500 hover:bg-accent-600 font-semibold py-3 px-8 rounded transition no-underline"
        >
          Home
        </a>
      </div>
    </div>
  </div>
</div>
