/** A single entry from OMDB's `?s=` search response. */
export interface OmdbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  /** An image URL, or the literal string "N/A" when OMDB has no artwork. */
  Poster: string;
}

/**
 * OMDB signals failure in the body rather than the status code, so a search
 * that simply matched nothing still arrives as HTTP 200.
 */
type OmdbResponse =
  | { Response: "True"; Search: OmdbMovie[]; totalResults: string }
  | { Response: "False"; Error: string };

/**
 * Every outcome callers have to handle. Modelling "no matches" separately from
 * "the request failed" is what keeps the empty case off the error path.
 */
export type SearchResult =
  | { status: "ok"; movies: OmdbMovie[]; total: number }
  | { status: "empty"; message: string }
  | { status: "error"; message: string };

export interface OmdbConfig {
  baseUrl: string;
  apiKey: string;
}

const REQUEST_TIMEOUT_MS = 8000;

/** OMDB always returns at most 10 results per page. */
export const RESULTS_PER_PAGE = 10;

/**
 * Runs in both the browser and Node — configuration is passed in rather than
 * read from `astro:env`, so this module stays free of environment assumptions.
 * It never throws; every failure is returned as an `error` result.
 */
export async function searchMovies(
  query: string,
  config: OmdbConfig,
  page = 1,
): Promise<SearchResult> {
  const params = new URLSearchParams({
    s: query,
    apikey: config.apiKey,
    page: String(page),
  });
  const url = `${config.baseUrl}/?${params}`;

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
  } catch (cause) {
    const timedOut = cause instanceof Error && cause.name === "TimeoutError";
    return {
      status: "error",
      message: timedOut
        ? "The movie database took too long to respond. Please try again."
        : "Could not reach the movie database. Please try again.",
    };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: `The movie database returned an error (HTTP ${response.status}).`,
    };
  }

  let data: OmdbResponse;
  try {
    data = (await response.json()) as OmdbResponse;
  } catch {
    return {
      status: "error",
      message: "The movie database returned a response we could not read.",
    };
  }

  if (data.Response === "False") {
    return { status: "empty", message: data.Error ?? "No movies found." };
  }

  return {
    status: "ok",
    movies: data.Search ?? [],
    total: Number.parseInt(data.totalResults, 10) || data.Search?.length || 0,
  };
}
