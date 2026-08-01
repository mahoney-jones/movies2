import {
  RESULTS_PER_PAGE,
  searchMovies,
  type OmdbConfig,
  type OmdbMovie,
} from "./omdb";
import { hasArtwork } from "./poster";

/** How many titles we aim to show per page of our own. */
export const PAGE_SIZE = 10;

/**
 * Ceiling on upstream requests per render. Filtering means one of our pages
 * can span several OMDB pages; this stops a search where almost nothing has
 * artwork from walking the entire result set.
 */
const MAX_REQUESTS = 6;

export type PageResult =
  | {
      status: "ok";
      movies: OmdbMovie[];
      /** Total matches OMDB reports, before any filtering. */
      total: number;
      hasNext: boolean;
    }
  | { status: "empty"; message: string }
  | { status: "error"; message: string };

/**
 * Cache of upstream pages, so refilling a page after a dead poster does not
 * refetch. Keyed by OMDB page; cleared when the query changes.
 */
let cacheKey = "";
const cache = new Map<number, Awaited<ReturnType<typeof searchMovies>>>();

/**
 * Poster URLs that OMDB advertises but that no longer resolve. This can only
 * be discovered by trying to load the image, so it is recorded as it is
 * learned and kept for the session — including across page navigations, which
 * are full page loads. Without it, a title known to be broken would reappear
 * and shift every subsequent page by one.
 */
const DEAD_KEY = "movies:dead-posters";
let deadFallback = new Set<string>();

function deadPosters(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DEAD_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    // Private browsing, or storage disabled — degrade to this page load only.
    return deadFallback;
  }
}

/** Records a poster URL as unreachable. Returns false if already known. */
export function markPosterDead(url: string): boolean {
  const dead = deadPosters();
  if (dead.has(url)) return false;
  dead.add(url);
  deadFallback = dead;
  try {
    sessionStorage.setItem(DEAD_KEY, JSON.stringify([...dead]));
  } catch {
    // Nothing to do — deadFallback still holds it for this page load.
  }
  return true;
}

/**
 * Fetches enough consecutive OMDB pages to fill one page of titles that have
 * artwork.
 *
 * OMDB paginates before we filter, so dropping posterless titles would
 * otherwise leave short pages — five results where ten were expected. This
 * keeps pulling upstream pages until it has enough survivors to fill the
 * requested page, then slices out that page's worth.
 */
export async function fetchPostered(
  query: string,
  config: OmdbConfig,
  page: number,
): Promise<PageResult> {
  if (cacheKey !== query) {
    cacheKey = query;
    cache.clear();
  }

  const needed = page * PAGE_SIZE;
  const dead = deadPosters();
  const keepers: OmdbMovie[] = [];
  let total = 0;
  let upstreamPage = 1;
  let requests = 0;
  let exhausted = false;

  // One extra beyond `needed` so we can tell whether a further page exists.
  while (keepers.length <= needed && requests < MAX_REQUESTS && !exhausted) {
    let result = cache.get(upstreamPage);
    if (!result) {
      result = await searchMovies(query, config, upstreamPage);
      requests += 1;
      // Only cache successes; a transient failure should be retried later.
      if (result.status !== "error") cache.set(upstreamPage, result);
    }

    if (result.status === "error") return result;
    if (result.status === "empty") {
      // Nothing matched at all, versus having run off the end of the results.
      if (upstreamPage === 1) return result;
      exhausted = true;
      break;
    }

    total = result.total;
    keepers.push(
      ...result.movies.filter(
        (m) => hasArtwork(m.Poster) && !dead.has(m.Poster),
      ),
    );

    if (upstreamPage * RESULTS_PER_PAGE >= total) exhausted = true;
    upstreamPage += 1;
  }

  const start = (page - 1) * PAGE_SIZE;
  return {
    status: "ok",
    movies: keepers.slice(start, start + PAGE_SIZE),
    total,
    hasNext: keepers.length > start + PAGE_SIZE || !exhausted,
  };
}
