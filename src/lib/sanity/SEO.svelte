<script lang="ts">
import SEO from "../seo/SEO.svelte";

let { metaInformation, uppercase = false } = $props();

let url = $state("https://trauma.art");
let title = $state(
  metaInformation?.title || "TRAUMA | AN INDEPENDENT ART WORLD",
);
let description = $state(
  metaInformation?.description ||
    "TRAUMA is a substrate for new culture, providing infrastructure for site-specific interventions aggregating visual art, media, performance and music. TRAUMA acts as curator or collaborator, antagonist or institution, depending on need and context. TRAUMA is also a network of social relations, channeling the shared vision of the distributed swarms that assemble at its events. TRAUMA is IRL, maintaining a base in Berlin with studios for its artists-in-residence.",
);
let imageAlt = $state(
  metaInformation?.title || "TRAUMA | AN INDEPENDENT ART WORLD",
);
let imageUrl = $state(metaInformation?.ogImage?.url || "/trauma-socials.png");
let language = $state(metaInformation?.language || "en-us");
let imageWidth = $state(
  metaInformation?.ogImage?.metadata?.dimensions?.width || "2270",
);
let imageHeight = $state(
  metaInformation?.ogImage?.metadata?.dimensions?.height || "1142",
);
</script>

<SEO
  url={url}
  prependTitle={`${uppercase ? title.toUpperCase() : title} | `}
  description={description}
  imageAlt={imageAlt}
  imageUrl={imageUrl}
  language={language}
  imageWidth={imageWidth}
  imageHeight={imageHeight}
/>
