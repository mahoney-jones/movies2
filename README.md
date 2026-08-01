# Movie Search App

Search movie titles, years and posters via the [OMDB API](https://www.omdbapi.com).

Built with [Astro](https://astro.build) and Tailwind CSS. Both pages are rendered
on the server and ship **no client-side JavaScript**.

## Prerequisites
- Node.js 22.12 or newer (required by Astro 7)
- npm

## Setup
```sh
npm install
```

## Run

Development server with hot reloading:
```sh
npm run dev
```

Production build and serve:
```sh
npm run build
npm start
```

The server listens on port `3000` by default; override with `PORT=<number>`.

## Configuration

Both variables are optional — the app runs with no configuration at all.

| Variable | Default | Purpose |
| --- | --- | --- |
| `OMDB_API_KEY` | `thewdb` | OMDB API key. The default is OMDB's public demo key; get your own at [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx). |
| `OMDB_BASE_URL` | `https://www.omdbapi.com` | API endpoint. Useful for pointing at a stub in tests. |
| `PORT` | `3000` | Port the server listens on. |

Set them in a `.env` file or the environment:
```sh
OMDB_API_KEY=yourkey npm start
```

Both are read at **runtime**, so one build can be deployed to several
environments. They are declared in `astro.config.mjs` under `env.schema`, which
makes them type-checked and keeps them off the client.

## Project layout

```
src/
  lib/omdb.ts          OMDB client — returns ok | empty | error, never throws
  lib/poster.ts        Poster URL sizing and missing-artwork handling
  layouts/Layout.astro Page shell
  components/          SearchForm, MovieCard
  pages/index.astro    Search form (prerendered)
  pages/results.astro  Search results (rendered per request)
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build to `dist/` |
| `npm start` | Serve the production build |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Type-check `.astro` and `.ts` files |
