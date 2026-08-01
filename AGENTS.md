# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` holds file-based routes. `index.astro` is the search form and is
  prerendered; `results.astro` sets `export const prerender = false` because it
  depends on the query string. `404.astro` and `500.astro` are the error pages.
- `src/lib/` holds framework-free TypeScript. `omdb.ts` owns all OMDB access;
  `poster.ts` owns poster URL handling. Keep these free of Astro imports (aside
  from `astro:env`) so they stay easy to test and reuse.
- `src/components/` holds `.astro` components; `src/layouts/Layout.astro` is the
  page shell that owns `<head>`, header and footer.
- `src/styles/global.css` is the single stylesheet — it only imports Tailwind.
- `public/` is for static assets served verbatim, if any are added.
- Configuration lives in `astro.config.mjs`. Secrets belong in environment
  variables declared under `env.schema`; never hardcode a key in source.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the dev server. Astro 7 detects AI coding agents and
  starts the dev server detached in the background — use `astro dev status`,
  `astro dev logs` and `astro dev stop` to manage it, or set
  `ASTRO_DEV_BACKGROUND=0` to run it in the foreground.
- `npm run build` produces `dist/`; `npm start` serves it on `PORT` (default 3000).
- `npm run check` runs `astro check` for types and template diagnostics. Run it
  before committing — it catches more than `tsc` alone.
- `npm test` currently fails by design; replace it when adding a test runner.

## Coding Style & Naming Conventions
- TypeScript throughout, `strict` via `astro/tsconfigs/strict`. ES modules only
  (`package.json` sets `"type": "module"`); no `require`.
- 2-space indentation. Prefer `const`; reserve `let` for genuine reassignment.
- Components are `PascalCase.astro`; routes are lowercase and dash-separated
  (`search-results.astro`); modules in `src/lib/` are lowercase (`omdb.ts`).
- Style with Tailwind utility classes in the markup. Reach for `global.css` only
  for genuinely global rules — there is no per-component stylesheet convention.
- Model fallible operations as returned unions rather than thrown exceptions —
  see `SearchResult` in `src/lib/omdb.ts`. Every branch must render something;
  a request that produces no response is the bug this design exists to prevent.

## Testing Guidelines
- Add tests with `vitest` under `tests/`, mirroring route and module names
  (e.g. `tests/omdb.test.ts`).
- `src/lib/omdb.ts` and `src/lib/poster.ts` are pure and are the highest-value
  targets — cover the `ok`, `empty` and `error` branches first.
- Stub OMDB rather than calling it. Point `OMDB_BASE_URL` at a local server and
  keep representative payloads under `tests/fixtures/`, including a title whose
  `Poster` is `"N/A"` and one whose URL carries no `_SX` size token.

## Commit & Pull Request Guidelines
- Use short, imperative subject lines (`Add search pagination`), with body detail
  for rationale where it helps.
- Reference related issues in the body (`Refs #123`) and describe user-visible
  changes in pull requests, including screenshots when views change.
- Document configuration impacts (new env vars, ports) and list manual
  verification steps so reviewers can reproduce quickly.
