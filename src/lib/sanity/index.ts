import {
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET,
} from "$env/static/public";
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const groqQueries = {
  settings: `*[_type == "settings"][0]{
    defaultPage
  }`,
  selected: `*[_type == "selected"][0]{
    selection[]->{
      _id,
      title,
      "slug": slug.current,
      "coverImage": coverImage{
        coverImage {
          asset->{
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          },
          hotspot,
          crop
        }
      },
      tags[]->{
        _id,
        title
      },
      ticketingUrl,
      date,
      description,
      gallery[]{
        ...,
        _type == "image" => {
          asset->{
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          }
        }
      },
      intro,
      "introPlain": pt::text(intro),
      "descriptionPlain": pt::text(description),
      "relatedProgram": *[_type == "event" && _id in ^.relatedProgram[]._ref] | order(date desc) {
        _id,
        title,
        "slug": slug.current,current,
      },
      creditsArray[]{
        name,
        socials,
        role,
        artistReference->{
          _id,
          name,
          role,
          "slug": slug.current,
          social[]{...}
        }
      },
      showRoles,
      meta{
        title,
        description,
        language,
        "ogImage": ogImage.asset->{
          url,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            }
          }
        }
      }
    }
  }`,
  artists: `*[_type == "artist" && _id in *[_type == "event"].artists[]._ref] | order(name asc) {
    _id,
    name,
    "slug": slug.current
  }`,
  artistsLinkedFromEvents: `*[_type == "artist" && (_id in *[_type == "event" && date >= "2020-01-01"].artists[]._ref || _id in *[_type == "event" && date >= "2020-01-01"].creditsArray[].artistReference._ref)] | order(name asc) {
    _id,
    name,
    "slug": slug.current
  }`,
  artist: `*[_type == "artist" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    bio,
    coverImage,
    social,
    "events": *[_type == "event" && references(^._id)] | order(date desc) {
      _id,
      title,
      "slug": slug.current,
      "coverImage": coverImage{
        coverImage {
          asset->{
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          },
          hotspot,
          crop
        }
      },
      tags[]->{
        _id,
        title
      },
      ticketingUrl,
      date,
      description,
      gallery[]{
        ...,
        _type == "image" => {
          asset->{
            _id,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          }
        }
      },
      intro,
      "introPlain": pt::text(intro),
      "descriptionPlain": pt::text(description),
      "relatedProgram": *[_type == "event" && _id in ^.relatedProgram[]._ref] | order(date desc) {
        _id,
        title,
        "slug": slug.current,
      },
      creditsArray[]{
        name,
      socials,
      role,
      artistReference->{
        _id,
        name,
        "slug": slug.current,
        social[]{...}
        }
      },
      showRoles,
      meta{
        title,
        description,
        language,
        "ogImage": ogImage.asset->{
          url,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            }
          }
        }
      }
    },
    meta{
      title,
      description,
      language,
      "ogImage": ogImage.asset->{
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      }
    }
  }`,
  pages: `*[_type == "page"]{
    _id,
    title,
    "slug": slug.current,
    content,
    meta{
      title,
      description,
      language,
      "ogImage": ogImage.asset->{
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      }
    }
  }`,
  eventsList: `*[_type == "event"] | order(date desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    endDate,
    address,
    venue,
    "venueUrl": venueURL,
    ticketingUrls,
    tags[]->{
      _id,
      title
    },
    intro,
    "coverImage": coverImage{
      coverImage {
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            }
          }
        },
        hotspot,
        crop
      }
    },
    "firstGalleryImage": gallery[0]{
      ...,
      _type == "image" => {
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            }
          }
        }
      }
    }
  }`,
  tvSelection: `*[_type == "tvSelection"][0]{
    "films": films[]{
      selectionMethod,
      "film": film->{
        _id,
        englishTitle,
        originalTitle,
        directorName,
        yearOfCompletion,
        length,
        categories,
        "poster": poster{ asset->{ _id, url, metadata } },
        "screenshot": screenshots[0]{ asset->{ _id, url, metadata } }
      }
    }
  }`,
  filmDetail: `*[_type == "submission" && _id == $id][0]{
    _id,
    englishTitle,
    originalTitle,
    directorName,
    yearOfCompletion,
    length,
    filmLanguage,
    synopsis,
    categories,
    categoryOther,
    website,
    explicit,
    explicitDetails,
    castAndCrew,
    thanks,
    previousScreenings,
    previousScreeningLocations,
    "poster": poster{ asset->{ _id, url, metadata } },
    "screenshots": screenshots[]{ asset->{ _id, url, metadata } }
  }`,
  event: `*[_type == "event" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    venue,
    "venueUrl": venueURL,
    ticketingUrls,
    "coverImage": coverImage{
      coverImage {
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            }
          }
        },
        hotspot,
        crop
      }
    },
    address,
    artists[]->{
      _id,
      name,
      "slug": slug.current,
      social[]{...}
    },
    tags[]->{
      _id,
      title
    },
    ticketingUrl,
    date,
    endDate,
    description,
    gallery[]{
      ...,
      _type == "image" => {
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            }
          }
        }
      }
    },
    intro,
    "introPlain": pt::text(intro),
    "descriptionPlain": pt::text(description),
    "relatedProgram": *[_type == "event" && _id in ^.relatedProgram[]._ref] | order(date desc) {
      _id,
      title,
      "slug": slug.current
    },
    creditsArray[]{
      name,
      socials,
      role,
      artistReference->{
        _id,
        name,
        "slug": slug.current,
        social[]{...}
      }
    },
    meta{
      title,
      description,
      language,
      "ogImage": ogImage.asset->{
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      }
    }
  }`,
};

export const client = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET,
  useCdn: false, // `false` if you want to ensure fresh data
  apiVersion: "2025-02-21", // date of setup
});

export const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}


// Document
export async function getDocument<T = unknown>(
  query: string,
  params?: Record<string, unknown>
): Promise<T> {
  try {
    return await client.fetch(query, params);
  } catch (error: unknown) {
    console.error('Error fetching document:', error);
    throw new Error('Failed to fetch document');
  }
}

// Add new function for paginated queries
export async function getPaginatedDocument<T extends Record<string, unknown>>(
  query: string, 
  start: number = 0, 
  end: number = 10
): Promise<PaginatedResponse<T>> {
  try {
    const response = await client.fetch(query, { start, end });
    return response;
  } catch (error: unknown) {
    console.error('Error fetching paginated document:', error);
    throw new Error('Failed to fetch paginated data');
  }
}

// Update type for paginated response to match our actual response structure
export type PaginatedResponse<T> = {
  [K in keyof T]: T[K];
} & {
  total: number;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}