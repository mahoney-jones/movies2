# Repository Guidelines

## Project Structure & Module Organization
- `app.js` defines the Express server, routes, and OMDB integration; keep new middleware near the existing route setup for clarity.
- `views/` contains EJS templates rendered by Express; shared markup lives in `views/partials/`.
- Static assets (CSS, client scripts) should be placed under a `public/` directory and served via `express.static` when introduced.
- Configuration and secrets belong in environment variables; avoid hardcoding keys in source.

## Build, Test, and Development Commands
- `npm install` installs server and templating dependencies listed in `package.json`.
- `npm start` runs `node app.js` and listens on `PORT` (defaults to 3000); use `PORT=4000 npm start` to test alternate ports.
- `npm test` currently fails by design—replace with your test runner before merging.

## Coding Style & Naming Conventions
- Use Node.js 18 features as needed but keep CommonJS imports (`require`) and 2-space indentation to match the existing files.
- Favor `const` for dependencies and immutable values; reserve `let` for reassignments.
- Name templates with lowercase words separated by dashes (e.g., `search-results.ejs`) and keep route handlers in `app.js` grouped by path.

## Testing Guidelines
- Add integration tests with `jest` + `supertest` or a similar stack under a new `tests/` directory, mirroring route names (e.g., `tests/results.test.js`).
- Stub external HTTP calls to OMDB with fixtures to avoid network flakiness; capture representative payloads under `tests/fixtures/`.
- Target high-level coverage of the `/results` query flow before extending to edge cases.

## Commit & Pull Request Guidelines
- Follow the existing history by using short, imperative subject lines (`Add search pagination`) and optional body details for rationale or follow-up work.
- Reference related issues in the commit body (`Refs #123`) and describe user-visible changes in pull requests, including screenshots of UI updates when views change.
- Ensure PRs document configuration impacts (new env vars, ports) and list manual verification steps (`npm start`, sample search) so reviewers can reproduce quickly.
