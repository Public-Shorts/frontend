<script lang="ts">
  import { page } from "$app/state"
  const defaultTitle : string = ""
  let {
    url = page.url.toString(),
    prependTitle = "",
    title = defaultTitle,
    description = "",
    imageAlt = "",
    imageUrl = "/",
    language = "en-us",
    imageWidth = "",
    imageHeight = ""
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