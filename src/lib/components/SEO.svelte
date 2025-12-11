<script lang="ts">
  import { page } from "$app/state"
  const defaultTitle : string = "24/7 Video Festival in Berlin"
  let {
    url = page.url.toString(),
    prependTitle = "Public Shorts | ",
    title = defaultTitle,
    description = "The 24/7 Video Festival in Berlin showcases short videos from around the world in a continuous 24-hour screening event.",
    imageAlt = "Window into Public Shorts Festival",
    imageUrl = "/images/og-image.png",
    language = "en-us",
    imageWidth = "1200",
    imageHeight = "630"
} = $props()
</script>

<svelte:head>
	<title>{prependTitle+title}</title>

	<meta name="siteUrl" content={url} />
	<meta name="pageTitle" content={prependTitle+title} />
	<meta name="description" content={description} />
	<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"/>

	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={prependTitle+title}>
	<meta name="twitter:description" content={description}>
	<meta name="twitter:image" content={imageUrl}>

	<meta property="og:site_name" content={prependTitle+title} />
	<meta property="og:locale" content={language} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={prependTitle+title} />
	<meta property="og:description" content={description} />

	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content={imageWidth} />
	<meta property="og:image:height" content={imageHeight} />
	<meta property="og:image:alt" content={imageAlt} />
</svelte:head>