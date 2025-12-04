<script lang="ts">
import { urlFor } from "$lib/sanity";
import { fade } from "svelte/transition";
import { onMount } from "svelte"
import { lightboxStore } from "$lib/stores/lightbox.svelte";

let {
  asset,
  height = 0,
  width = $bindable(),
  noClick = false,
  alt = "TRAUMA", fadeTime = 400
} = $props();

let innerWidth = $state(0)
let innerHeight = $state(0)
let mouseover = $state(false)
let pointertime = $state<number | null>(null)
let container = $state<null | HTMLElement>(null)
let inView = $state(false)

const onpointerenter= () => mouseover = true
const onpointerleave= () => mouseover = false
const onpointerdown= () => {
      pointertime = performance.now()
    }
const onpointerup= () => {
  const now = performance.now()
  console.log(pointertime)
  if (now - pointertime < 300 && !noClick) {
    lightboxStore.open(urlFor(asset).width(1920).url(), alt)
  }
  pointertime = null
}

let aspectRatio = $derived.by(() => {
  if (asset) {
    return asset?.asset?.metadata?.dimensions?.aspectRatio || asset?.metadata?.dimensions?.aspectRatio || '16/9'
  } else {
    return "auto"
  }
})

const handleScroll = () => {
  if (!container || innerWidth >= 1024) { // Only run on mobile (screens < 1024px)
    inView = false;
    return;
  }

  const rect = container.getBoundingClientRect();
  const topRatio = rect.top / innerHeight;
  const bottomRatio = rect.bottom / innerHeight;

  // Check if the top is within the top 30% of the viewport,
  // and the bottom is below the 90% mark of the viewport.
  if (topRatio > 0.1 && bottomRatio < 0.9) {
    inView = true;
  } else {
    inView = false;
  }
};

onMount(handleScroll)
</script>

<svelte:window bind:innerWidth bind:innerHeight on:scroll={handleScroll} />

{#if width}
  <div
    bind:this={container}
    in:fade={{  duration: fadeTime, delay: fadeTime + 10 }}
    out:fade={{ duration: fadeTime}}
    {onpointerenter}
    {onpointerleave}
    {onpointerdown}
    {onpointerup}
    role="button"
    tabindex="0"
    class="bg-sand-200 group relative w-full"
    style="aspect-ratio: {aspectRatio};"
  >
    <div class="absolute inset-0">
      <img
        draggable="false"
        class="w-full h-full object-cover mix-blend-multiply grayscale"
        src={urlFor(asset).width(width).url()}
        alt={alt}
      />
    </div>
    {#if mouseover || inView}
      <div
        in:fade|global={{  duration: 100 }}
        out:fade|global={{ duration: 100}}
        class="absolute inset-0 transition-opacity duration-150 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
        <img
          draggable="false"
          class="w-full h-full object-cover"
          src={urlFor(asset).width(width).url()}
          alt={alt}
        />
      </div>
    {/if}
  </div>
{:else if height}
  <div
    bind:this={container}
    in:fade|global={{  duration: fadeTime, delay: fadeTime }}
    out:fade|global={{ duration: fadeTime}}
        {onpointerenter}
    {onpointerleave}
    {onpointerdown}
    {onpointerup}
    role="button"
    tabindex="0"
    class=" bg-sand-200 group relative h-full"
  >
    <div
      class="bg-sand-200 relative z-0 h-full opacity-100 transition-opacity duration-150 lg:group-hover:opacity-0 absolute inset-0"
    >
      <img
        draggable="false"
        class="h-full mix-blend-multiply grayscale"
        src={urlFor(asset).height(height).url()}
        alt={alt}
      />
    </div>
    {#if mouseover || inView}
      <img
        in:fade|global={{  duration: 100 }}
        out:fade|global={{ duration: 100}}
        draggable="false"
        class="relative z-10 h-full -translate-y-full transition-all"
        src={urlFor(asset).height(height).url()}
        alt={alt}
      />
    {/if}
  </div>
{/if}

