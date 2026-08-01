import type { OmdbMovie } from "./omdb";
import {
  POSTER_HEIGHT,
  POSTER_WIDTH,
  posterSrcSet,
  posterUrl,
} from "./poster";

/** The "No poster available" filler, shared by the N/A and dead-link cases. */
function buildPlaceholder(): HTMLElement {
  const placeholder = document.createElement("div");
  placeholder.className =
    "flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-slate-400 dark:text-slate-500";

  const icon = document.createElement("span");
  icon.className = "text-3xl";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "🎞️";

  const label = document.createElement("span");
  label.className = "text-xs font-medium";
  label.textContent = "No poster available";

  placeholder.append(icon, label);
  return placeholder;
}

/**
 * Builds a card with DOM APIs rather than an HTML string. Titles come from a
 * third-party API, so keeping them in `textContent` means they can never be
 * parsed as markup.
 */
export function createMovieCard(movie: OmdbMovie): HTMLElement {
  const card = document.createElement("article");
  card.className =
    "group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900";

  const frame = document.createElement("div");
  frame.className =
    "aspect-[2/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800";

  const src = posterUrl(movie.Poster);
  if (src) {
    const img = document.createElement("img");

    // OMDB's database carries plenty of stale poster URLs, and our size
    // rewrite could in principle produce a variant the CDN refuses. On
    // failure, retry once with the URL exactly as OMDB supplied it; if that
    // fails too the link is dead, so degrade to the placeholder instead of
    // the browser's broken-image icon. Attached before src is set so the
    // error can't fire first.
    let triedOriginal = src === movie.Poster;
    img.addEventListener("error", () => {
      if (!triedOriginal) {
        triedOriginal = true;
        img.removeAttribute("srcset");
        img.src = movie.Poster;
        return;
      }
      frame.replaceChildren(buildPlaceholder());
    });

    img.src = src;
    const srcset = posterSrcSet(movie.Poster);
    if (srcset) img.srcset = srcset;
    img.alt = `Poster for ${movie.Title}`;
    img.width = POSTER_WIDTH;
    img.height = POSTER_HEIGHT;
    img.loading = "lazy";
    img.decoding = "async";
    img.className =
      "h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]";
    frame.append(img);
  } else {
    frame.append(buildPlaceholder());
  }

  const body = document.createElement("div");
  body.className = "p-3";

  const title = document.createElement("h2");
  title.className = "text-sm font-semibold leading-snug";
  title.textContent = movie.Title;

  const year = document.createElement("p");
  year.className = "mt-0.5 text-xs text-slate-500 dark:text-slate-400";
  year.textContent = movie.Year;

  body.append(title, year);
  card.append(frame, body);
  return card;
}
