# Movie Search App

Search movie titles, years and posters via the [OMDB API](https://www.omdbapi.com).

Built with [Astro](https://astro.build) and Tailwind CSS. The site is fully
static — every page is prerendered and the search runs in the browser — so it
can be hosted anywhere, including GitHub Pages.

Results are filtered to titles that have artwork. OMDB reports `"N/A"` for
titles it knows have none, and also returns plenty of poster URLs that no
longer resolve; both are hidden, the latter once the image fails to load.

Because OMDB paginates before that filtering happens, `src/lib/paging.ts`
draws from as many upstream pages as it takes to fill a page of ten. Dead
poster URLs are remembered in `sessionStorage` for the session, so a refill
stays consistent and pages do not repeat titles across their boundaries. Two
consequences: a page view can cost more than one upstream request (capped by
`MAX_REQUESTS`), and a total page count is not knowable in advance, so
pagination shows "Page N" with Next driven by whether more results remain.

To show every title instead, drop the `hasArtwork` filter in `paging.ts` and
omit the `onPosterUnavailable` callback in `src/pages/results.astro` — cards
then fall back to a "No poster available" placeholder.

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

Production build, then serve it locally:
```sh
npm run build
npm start
```

## Configuration

Everything is optional — the app runs with no configuration at all.

| Variable | Default | Purpose |
| --- | --- | --- |
| `OMDB_API_KEY` | `thewdb` | OMDB API key. The default is OMDB's public demo key; get your own at [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx). |
| `OMDB_BASE_URL` | `https://www.omdbapi.com` | API endpoint. Useful for pointing at a stub in tests. |
| `BASE_PATH` | `/movies2` | Path the site is served under. |
| `SITE` | `https://mahoney-jones.github.io` | Canonical origin. |

Because the search runs in the browser, `OMDB_API_KEY` is **compiled into the
client bundle and is publicly visible**. That is fine for OMDB's demo key and
for any free key you do not mind exposing. If you need the key kept private,
render the search on the server instead — see "Going back to server rendering".

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes on every push to `master`
or the feature branch. It derives the base path from the repository name, so a
fork or a rename needs no edit.

**One-time setup:** in the repository, go to **Settings → Pages** and set
**Source** to **GitHub Actions**. Without this the workflow will fail at the
deploy step. Optionally add an `OMDB_API_KEY` repository *variable*
(Settings → Secrets and variables → Actions → Variables) to use your own key.

The site then publishes to `https://<owner>.github.io/<repo>/`.

## Project layout

```
src/
  lib/omdb.ts          OMDB client — returns ok | empty | error, never throws
  lib/poster.ts        Poster URL sizing and missing-artwork handling
  lib/movie-card.ts    Builds a result card with DOM APIs
  layouts/Layout.astro Page shell
  components/          SearchForm
  pages/index.astro    Search form
  pages/results.astro  Static shell + the client-side search script
```

## Going back to server rendering

An earlier revision rendered `/results` on the server, which shipped zero
JavaScript and kept the API key private. To return to that:

1. `npm install @astrojs/node`
2. In `astro.config.mjs`: add `adapter: node({ mode: "standalone" })`, and move
   the env fields to `context: "server", access: "secret"` so they are read at
   runtime rather than inlined.
3. In `results.astro`: set `prerender = false` and do the `searchMovies()` call
   in the frontmatter instead of the `<script>`.
4. Set `"start": "node ./dist/server/entry.mjs"`.

That build cannot be hosted on GitHub Pages, which serves static files only.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build to `dist/` |
| `npm start` | Preview the production build |
| `npm run check` | Type-check `.astro` and `.ts` files |
