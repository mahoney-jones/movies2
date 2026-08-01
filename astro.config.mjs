// @ts-check
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: node({ mode: "standalone" }),
  env: {
    schema: {
      // Defaults to the public demo key so a fresh clone runs with no setup.
      OMDB_API_KEY: envField.string({
        context: "server",
        access: "secret",
        default: "thewdb",
      }),
      // `secret` rather than `public` because astro:env inlines public values at
      // build time. This one has to be read at runtime so the same build can be
      // pointed at a different endpoint (a stub, a staging proxy) without rebuilding.
      OMDB_BASE_URL: envField.string({
        context: "server",
        access: "secret",
        default: "https://www.omdbapi.com",
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
