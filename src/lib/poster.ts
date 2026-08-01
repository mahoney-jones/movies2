/**
 * OMDB serves posters from Amazon's image CDN, whose filenames carry a size
 * token (`..._V1_SX300.jpg`). Rewriting that token asks the CDN for an
 * appropriately sized image instead of downloading a full-size poster into a
 * thumbnail slot.
 */
const SIZE_TOKEN = /_SX\d+/;

/** Rendered poster size. Movie posters are conventionally 2:3. */
export const POSTER_WIDTH = 200;
export const POSTER_HEIGHT = 300;

/** OMDB uses this literal string when it has no artwork for a title. */
function hasArtwork(poster: string | undefined): poster is string {
  return typeof poster === "string" && poster !== "" && poster !== "N/A";
}

/**
 * Returns a poster URL sized to `width`, or `null` when there is no artwork.
 *
 * If the URL does not carry a recognisable size token it is returned unchanged,
 * so an unexpected shape degrades to the original image rather than breaking.
 */
export function posterUrl(
  poster: string | undefined,
  width: number = POSTER_WIDTH,
): string | null {
  if (!hasArtwork(poster)) return null;
  return poster.replace(SIZE_TOKEN, `_SX${width}`);
}

/** A 1x/2x srcset so high-density screens get sharp posters. */
export function posterSrcSet(
  poster: string | undefined,
  width: number = POSTER_WIDTH,
): string | null {
  if (!hasArtwork(poster)) return null;
  const one = posterUrl(poster, width);
  const two = posterUrl(poster, width * 2);
  if (!one || !two || one === two) return null;
  return `${one} 1x, ${two} 2x`;
}
