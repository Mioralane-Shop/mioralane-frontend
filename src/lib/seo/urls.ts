/**
 * SEO — canonical origin and absolute-URL helper.
 *
 * `SITE_URL` (`src/constants/site.ts`) is the single source of truth for the
 * public origin. Everything canonical-facing (canonical tags, Open Graph URLs,
 * JSON-LD `url`/`@id`, sitemap entries) is derived from it here, so the origin
 * appears exactly once in the codebase.
 *
 * The relative import carries an explicit `.ts` extension because
 * `scripts/verify-seo.ts` executes this module under Node's type stripping,
 * which resolves relative specifiers by their real file name. See the
 * `allowImportingTsExtensions` note in `tsconfig.json`.
 */
import { SITE_URL } from "../../constants/site.ts";

/** The public origin, normalised with no trailing slash. */
export const SITE_ORIGIN = SITE_URL.replace(/\/+$/, "");

/**
 * Turn a site path into an absolute URL. Already-absolute values (an ImageKit
 * image, a social profile) are returned untouched so a caller can pass a stored
 * URL through without a double prefix.
 */
export function absoluteUrl(path = "/"): string {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) {
    return path;
  }

  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
