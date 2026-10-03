/**
 * P1.4 Block B — the read-side half of the stored-URL guard.
 *
 * Block A made the API refuse to *store* a URL that is not an `https://` URL or a
 * site-relative path (`safeUrlSchema` in mioralane-backend/src/utils/validation.ts).
 * That is a write-side control only: every value stored before it landed — and
 * every value written by anything that does not go through those schemas — is
 * still exactly as dangerous on read as it was before. This is the guard that runs
 * where the value is rendered, so a `javascript:` URL already sitting in the
 * database cannot become an `href`.
 *
 * The rule is copied clause for clause from the backend schema, including the
 * parts that look redundant:
 *
 *   `''`           accepted as "not supplied" — an empty href does nothing
 *   `https://…`    accepted
 *   `/path`        accepted, but only when position 1 is not `/` or `\`
 *   `//evil`       refused — a browser reads a leading `//` as an absolute URL to
 *                  another host, so `startsWith("/")` alone is not enough
 *   `/\evil`       refused — browsers normalise the backslash to a slash
 *   `javascript:`  refused, as is anything else
 *
 * Deliberately React-free and import-free: one definition of "safe" on this side,
 * callable from anywhere, and directly testable.
 */

/** The only absolute scheme this storefront will navigate to. */
const ALLOWED_SCHEME_PREFIX = "https://";

/**
 * A site-relative path, and only a site-relative path.
 *
 * The one subtle condition is position 1: `/` there makes the value
 * protocol-relative (an absolute URL to another host), and `\` is normalised to
 * `/` by browsers, so both are refused.
 */
const isSiteRelativePath = (url: string): boolean =>
  url.startsWith("/") && url[1] !== "/" && url[1] !== "\\";

/**
 * The predicate, matching the backend's `safeUrlSchema()` clause for clause.
 *
 * Trims first, exactly as the Zod schema does, so a stored `" javascript:…"` is
 * judged on its trimmed value rather than slipping past on leading whitespace.
 * Non-strings are refused rather than coerced.
 */
export const isSafeHref = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  const url = value.trim();

  return url === "" || url.startsWith(ALLOWED_SCHEME_PREFIX) || isSiteRelativePath(url);
};

/**
 * The value to render into an `href`, or `null` when there is nothing safe to
 * render.
 *
 * One deliberate difference from {@link isSafeHref}: an empty string comes back as
 * `null`. The backend accepts `''` as "not supplied", but the caller needs a
 * different answer — `href=""` is still an anchor (it navigates to the current
 * page) — so "no URL supplied" has to mean "render no link". Call sites branch on
 * this and fall back to plain text; they must never substitute `"#"`, which is a
 * link that goes nowhere and still looks and behaves like one.
 *
 * Returning the trimmed value rather than a boolean is also what keeps the check
 * and the rendered value identical: the href is exactly the string that passed.
 */
export const safeHref = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const url = value.trim();

  return url !== "" && isSafeHref(url) ? url : null;
};
