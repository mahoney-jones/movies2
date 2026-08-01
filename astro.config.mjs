// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Project page for github.com/mahoney-jones/movies2.
// Override with SITE / BASE_PATH when deploying somewhere else.
const site = process.env.SITE ?? "https://mahoney-jones.github.io";
const base = process.env.BASE_PATH ?? "/movies2";

export default defineConfig({
  site,
  base,
  // Fully static: every page is prerendered and the search runs in the browser,
  // so the build can be served by GitHub Pages with no server involved.
  output: "static",
  trailingSlash: "always",
  env: {
    schema: {
      // Client context: these are compiled into the browser bundle and are
      // therefore public by definition. `thewdb` is OMDB's own demo key.
      OMDB_API_KEY: envField.string({
        context: "client",
        access: "public",
        default: "thewdb",
      }),
      OMDB_BASE_URL: envField.string({
        context: "client",
        access: "public",
        default: "https://www.omdbapi.com",
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
