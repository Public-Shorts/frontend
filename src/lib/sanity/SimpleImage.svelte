<script lang="ts">
import { urlFor } from "$lib/sanity";

type ImageAsset = {
  asset: {
    _ref: string;
    metadata?: {
      dimensions?: {
        aspectRatio?: number;
      };
    };
  };
  metadata?: {
    dimensions?: {
      aspectRatio?: number;
    };
  };
};

let {
  asset,
  alt = "",
  width,
  height,
  class: className = "",
  ...rest
}: {
  asset: ImageAsset;
  alt?: string;
  width?: number;
  height?: number;
  class?: string;
  [key: string]: any;
} = $props();

let imageUrl = $derived.by(() => {
  let builder = urlFor(asset);
  if (width) builder = builder.width(width);
  if (height) builder = builder.height(height);
  return builder.url();
});
</script>

<img src={imageUrl} {alt} class={className} {...rest} />
