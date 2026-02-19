# Public Shorts — Frontend

Public-facing festival website built with SvelteKit 2 + Svelte 5, deployed on Vercel.

## SSR

The entire site is server-side rendered (SSR). SvelteKit SSR is enabled by default and no pages opt out. All data fetching happens in `+page.server.ts` files, ensuring content is rendered on the server before reaching the client. The Vercel adapter handles SSR deployment automatically.

## Developing

Install dependencies and start the dev server:

```sh
pnpm install
pnpm dev
```

## Building

```sh
pnpm build
```

Preview the production build:

```sh
pnpm preview
```

## Type Checking & Linting

```sh
pnpm check    # svelte-check + TypeScript
pnpm lint     # Prettier + ESLint
pnpm format   # Auto-format with Prettier
```
