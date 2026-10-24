/**
 * The read-side guard for stored **image** URLs.
 *
 * `images.remotePatterns` in `next.config.mjs` allows exactly one remote origin —
 * `https://ik.imagekit.io/7sz3r4tou/**`. That list is a *loader* control, and it
 * fails loudly rather than gracefully: `next/image`'s default loader **throws**
 * at render time when the src's host is not configured.
 *
 *     Error: Invalid src prop (https://images.unsplash.com/photo-…) on `next/image`,
 *     hostname "images.unsplash.com" is not configured under images in your `next.config.js`
 *
 * A throw inside a client component is not a broken thumbnail — it takes out the
 * whole subtree. `CartDrawer` is mounted in the root layout, so **one** stored
 * URL on a foreign host, delivered by the cross-sell recommendations, crashes
 * *every* route.
 *
 * ⚠️ Corrected assumption: the P1.5b note (and the comment in `next.config.mjs`)
 * said a removed host "now renders `ProductImage`'s placeholder". That is wrong,
 * and it is why this shipped: the placeholder only appears for a src that *loads*
 * and then errors (`onError`) — an unconfigured host never gets that far. A guard
 * has to run *before* the src reaches `next/image`.
 *
 * Two clauses have to be reproduced exactly, and the second is the one that is
 * easy to miss:
 *
 *   - the **hostname** is not the allowlist; `ik.imagekit.io` is multi-tenant, so
 *     its **pathname** must start with our endpoint id too. `isImageKitUrl()`
 *     (`lib/imagekit-delivery.ts`) deliberately checks only the hostname, because
 *     it only decides which loader to attach — it must NOT be used as a gate.
 *   - a site-relative path is served from `public/` with no host validation
 *     (there is no `images.localPatterns` entry), so it is always renderable —
 *     except `//evil.example/x`, which a browser reads as another host.
 *
 * Deliberately React-free and import-free, like `lib/safe-href.ts`: one
 * definition of "renderable", callable from anywhere, directly testable.
 * `scripts/verify-url-guard.ts` asserts that this module's two constants still
 * agree with `next.config.mjs`, so the guard cannot silently drift from the
 * allowlist it mirrors.
 */

/** The only remote host the image optimizer is allowed to fetch from. */
export const IMAGE_REMOTE_HOSTNAME = "ik.imagekit.io";

/** Our endpoint id on that multi-tenant host. */
export const IMAGE_REMOTE_PATH_PREFIX = "/7sz3r4tou";

/** A site-relative path, and only a site-relative path (mirrors `safe-href.ts`). */
function isSiteRelativePath(src: string): boolean {
  return src.startsWith("/") && src[1] !== "/" && src[1] !== "\\";
}

/** `https://ik.imagekit.io/7sz3r4tou/…` — hostname AND endpoint prefix. */
function isAllowedRemoteImage(src: string): boolean {
  if (!src.startsWith("https://")) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }

  return (
    url.hostname === IMAGE_REMOTE_HOSTNAME &&
    url.pathname.startsWith(`${IMAGE_REMOTE_PATH_PREFIX}/`)
  );
}

/**
 * Whether `src` can be handed to `next/image` without the default loader
 * throwing. `false` means "render the placeholder".
 *
 * Deliberately strict: a value the optimizer would in fact accept but this
 * predicate refuses only costs a placeholder, whereas the reverse costs a crash.
 */
export function isRenderableImageSrc(src: string | null | undefined): src is string {
  if (typeof src !== "string") {
    return false;
  }

  const value = src.trim();
  if (!value) {
    return false;
  }

  return isSiteRelativePath(value) || isAllowedRemoteImage(value);
}

/** The first renderable candidate, or `null`. */
export function firstRenderableImageSrc(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    if (isRenderableImageSrc(candidate)) {
      return candidate.trim();
    }
  }

  return null;
}
