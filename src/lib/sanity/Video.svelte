<script lang="ts">
  import  {onMount} from "svelte"
  let {
    url,
    height,
    width = $bindable(),
    thumbnailOnly = false
  } = $props()

  console.log(url, "url width height", width, height)
  
  let embed = $state("")
  let thumbnailUrl = $state("")
  let aspectRatio = $state(1920 / 1080)
  let hovered = $state(false)
  let showPlayer = $state(false)

  const init = async () => {
    // https://developer.vimeo.com/api/oembed/videos
    try {
      // Request 1; figure out the metadata
      const autoplayParam = (thumbnailOnly && showPlayer) ? '&autoplay=1' : ''
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURI(url)}&width=${width}${autoplayParam}`)
      const result = await response.json()

      console.log('Video oembed result:', result)
      console.log('Thumbnail dimensions:', result.thumbnail_width, 'x', result.thumbnail_height)

      aspectRatio = result.thumbnail_width / result.thumbnail_height
      console.log('Calculated aspect ratio:', aspectRatio)

      // Get highest resolution thumbnail by replacing size suffix
      thumbnailUrl = result.thumbnail_url.replace(/_\d+x\d+/, '')

      if (!thumbnailOnly || showPlayer) {
        console.log('Embed HTML:', result.html)
        embed = result.html
      }
    } catch (error) {
      console.error(error)
    }
  }

  let computedWidth = $derived.by(() => {
    // If only height is provided, calculate width from aspect ratio
    if (height && !width && aspectRatio) {
      return height * aspectRatio
    }

    if (!height || !width || !aspectRatio) return width

    // Fit within the provided width/height box while maintaining aspect ratio
    const widthBasedOnHeight = height * aspectRatio
    const heightBasedOnWidth = width / aspectRatio

    if (widthBasedOnHeight <= width) {
      // Height is the limiting factor
      return widthBasedOnHeight
    } else {
      // Width is the limiting factor
      return width
    }
  })

  let computedHeight = $derived.by(() => {
    if (!height || !width || !aspectRatio) return height

    // Fit within the provided width/height box while maintaining aspect ratio
    const widthBasedOnHeight = height * aspectRatio
    const heightBasedOnWidth = width / aspectRatio

    if (widthBasedOnHeight <= width) {
      // Height is the limiting factor
      return height
    } else {
      // Width is the limiting factor
      return heightBasedOnWidth
    }
  })

  const onMouseEnter = () => hovered = true
  const onMouseLeave = () => hovered = false
  const onThumbnailClick = () => {
    showPlayer = true
    init() // Load the embed
  }

  // Sync computed width back to bindable prop
  $effect(() => {
    if (computedWidth !== undefined && computedWidth !== width) {
      width = computedWidth
    }
  })

  onMount(() => {
    // Get the oembed
    init()
  })
</script>


<div class="activate-color" class:active={hovered}>
  {#if thumbnailOnly && thumbnailUrl}
    {#if !height}
      <button
        onclick={onThumbnailClick}
        onmouseenter={onMouseEnter}
        onmouseleave={onMouseLeave}
        class:active={hovered}
        class="video-thumbnail-wrapper gray-to-color w-full cursor-pointer border-0 p-0 bg-transparent relative">
        <img src={thumbnailUrl} alt="Video thumbnail" class="w-full transition-opacity duration-300" class:opacity-0={showPlayer} />
        <div class="play-button absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/50 flex items-center justify-center transition-opacity duration-300" class:opacity-0={showPlayer}>
          <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        {#if showPlayer}
          <div class="absolute top-0 left-0 w-full h-0 pb-[{width * aspectRatio / width * 100}%]">
            {@html embed}
          </div>
        {/if}
      </button>
    {:else}
      <button
        onclick={onThumbnailClick}
        onmouseenter={onMouseEnter}
        onmouseleave={onMouseLeave}
        class:active={hovered}
        style:height="{computedHeight}px"
        style:width="{computedWidth}px"
        class="video-thumbnail-wrapper gray-to-color cursor-pointer border-0 p-0 bg-transparent relative">
        <img src={thumbnailUrl} alt="Video thumbnail" style:height="{computedHeight}px" style:width="{computedWidth}px" class="object-cover transition-opacity duration-300" class:opacity-0={showPlayer} />
        <div class="play-button absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/50 flex items-center justify-center transition-opacity duration-300" class:opacity-0={showPlayer}>
          <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        {#if showPlayer}
          <div class="video-embed absolute top-0 left-0" style:height="{computedHeight}px" style:width="{computedWidth}px">
            {@html embed}
          </div>
        {/if}
      </button>
    {/if}
  {:else if !height}
    <div
      onmouseenter={onMouseEnter}
      onmouseleave={onMouseLeave}
      class:active={hovered}
      class="video-embed gray-to-color relative w-full h-0 flex" style:padding-bottom="{width * aspectRatio / width * 100}%">
      {@html embed}
    </div>
  {:else}
    <div
      onmousenter={onMouseEnter}
      onmouseleave={onMouseLeave}
      class:active={hovered}
      style:height="{computedHeight}px"
      style:width="{computedWidth}px"
      class="video-embed gray-to-color relative">
      {@html embed}
    </div>
  {/if}
</div>

<style lang="postcss">
:global(.video-embed iframe) {
  @apply absolute top-0 left-0 w-full h-full;
}
</style>
