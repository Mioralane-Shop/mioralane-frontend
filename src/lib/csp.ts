/**
 * P1.4 Block C — the Content Security Policy, as data.
 *
 * This module is deliberately **import-free and side-effect-free**:
 *
 *   - `scripts/verify-headers.ts` imports it under Node's type stripping, so it
 *     can hold no `next/*` import (and no `process.env` read — every input is an
 *     argument, which is what makes `buildCsp` testable and "pure"),
 *   - `src/middleware.ts` imports it on the Edge runtime.
 *
 * The policy ships as `Content-Security-Policy-Report-Only` for a 7-day
 * observation window; see `src/middleware.ts` for the wiring and the report
 * format for the directive-by-directive rationale.
 *
 * Every origin below was read out of this app's source rather than guessed — the
 * harness asserts the policy still covers them, and names the file each one came
 * from.
 */

/** The header Next.js reads a nonce from, on the *request*. */
export const CSP_HEADER = "Content-Security-Policy";

/** The header this block actually ships, on the *response*. */
export const CSP_REPORT_ONLY_HEADER = "Content-Security-Policy-Report-Only";

/**
 * Google Identity Services — the only third-party script on the storefront.
 *
 * `providers/google-auth-provider.tsx` wraps the app in
 * `GoogleOAuthProvider`, which injects `https://accounts.google.com/gsi/client`.
 * The library also inserts a `<link rel="stylesheet">` to
 * `https://accounts.google.com/gsi/style` into this document, and renders the
 * button in an iframe on the same origin — hence the three directives it appears
 * in (`script-src`, `style-src`, `frame-src`) plus `connect-src`, which
 * `/gsi/…` XHR traffic needs. Dropping any of them breaks Google Sign-In.
 */
export const GOOGLE_IDENTITY_ORIGIN = "https://accounts.google.com";

/**
 * Satoshi, loaded by a plain `<link rel="stylesheet">` in
 * `src/app/layout.tsx` — the one external stylesheet.
 *
 * The stylesheet is `api.fontshare.com`; the `@font-face` files it declares are
 * served from `cdn.fontshare.com`, so the two origins land in two directives.
 */
export const FONTSHARE_STYLESHEET_ORIGIN = "https://api.fontshare.com";
export const FONTSHARE_FONT_ORIGIN = "https://cdn.fontshare.com";

/**
 * Product imagery, requested from ImageKit **directly**: `ProductImage` passes a
 * custom `next/image` loader (`src/lib/imagekit-delivery.ts`), so these requests
 * are not proxied through `/_next/image`. A `'self'`-only `img-src` blanks the
 * whole catalogue.
 */
export const IMAGEKIT_ORIGIN = "https://ik.imagekit.io";

/**
 * Google account pictures. `auth.controller.ts` copies the Google `picture`
 * claim onto `user.avatar`, and `user-menu.tsx` renders it with
 * `unoptimized` — i.e. straight from `lh3.googleusercontent.com`.
 */
export const GOOGLE_AVATAR_ORIGIN = "https://*.googleusercontent.com";

/** 16 bytes of CSPRNG output, base64 — 128 bits, standard `nonce-value` grammar. */
const NONCE_BYTES = 16;

export interface CspOptions {
  /** Origins the app may `fetch`/XHR (the API, plus whatever else is needed). */
  connectOrigins?: readonly string[];
  /**
   * Development only. webpack's `eval`-based source maps are a script source, so
   * without this every dev page reports an `unsafe-eval` violation that
   * production would never have.
   */
  allowEval?: boolean;
  /**
   * Development only. Next's dev server injects un-nonced `<style>` tags for
   * HMR, and `'unsafe-inline'` is *ignored* whenever a nonce is present in the
   * same directive — so the dev policy drops the nonce from `style-src` rather
   * than listing a directive that would do nothing.
   */
  allowInlineStyles?: boolean;
  /** Production only: the site is HTTPS-only, so plain-http subresources are a bug. */
  upgradeInsecureRequests?: boolean;
  /** Optional collector for the observation window. Omitted when not configured. */
  reportUri?: string;
}

/**
 * A fresh nonce per response.
 *
 * `crypto.getRandomValues` (Web Crypto) rather than `Math.random`: a guessable
 * nonce is the same as no nonce at all. Available on the Edge runtime and in
 * Node >= 19, which is what the harness runs on.
 */
export const createNonce = (): string => {
  const bytes = new Uint8Array(NONCE_BYTES);
  crypto.getRandomValues(bytes);

  // A plain indexed loop, not `for…of` or a spread: this app's tsconfig has no
  // `target`, so it compiles at ES5 and either form needs `downlevelIteration`.
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
};

const unique = (values: readonly string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
};

/**
 * The policy string for one response.
 *
 * Pure: the same arguments always produce the same string, which is what lets
 * the harness assert both the production and the development shape without
 * touching `process.env`.
 */
export const buildCsp = (nonce: string, options: CspOptions = {}): string => {
  const {
    connectOrigins = [],
    allowEval = false,
    allowInlineStyles = false,
    upgradeInsecureRequests = false,
    reportUri,
  } = options;

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    // With `'strict-dynamic'` a CSP3 browser ignores the host source below and
    // trusts only nonce-bearing scripts (Next's own bootstrap) plus whatever
    // those scripts insert (the GSI client). The host stays for CSP2 browsers,
    // which do not implement `'strict-dynamic'` and would otherwise block GSI.
    "'strict-dynamic'",
    ...(allowEval ? ["'unsafe-eval'"] : []),
    GOOGLE_IDENTITY_ORIGIN,
  ];

  const styleSrc = [
    "'self'",
    ...(allowInlineStyles ? ["'unsafe-inline'"] : [`'nonce-${nonce}'`]),
    FONTSHARE_STYLESHEET_ORIGIN,
    // The GSI client inserts `<link rel="stylesheet" href="…/gsi/style">` here.
    GOOGLE_IDENTITY_ORIGIN,
  ];

  const directives: string[] = [
    // Baseline for every fetch directive not named below.
    "default-src 'self'",
    // An injected `<base href>` would re-point every relative URL on the page.
    "base-uri 'self'",
    // No Flash/PDF/silverlight surface; also `default-src`'s job, made explicit.
    "object-src 'none'",
    // Modern clickjacking control. Duplicates the X-Frame-Options header in
    // `next.config.mjs`, which is kept for pre-CSP browsers.
    "frame-ancestors 'none'",
    // A compromised form must not be able to POST credentials off-site.
    "form-action 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `font-src 'self' ${FONTSHARE_FONT_ORIGIN} data:`,
    `img-src 'self' data: blob: ${IMAGEKIT_ORIGIN} ${GOOGLE_AVATAR_ORIGIN}`,
    `connect-src ${unique(["'self'", ...connectOrigins, GOOGLE_IDENTITY_ORIGIN]).join(" ")}`,
    `frame-src ${GOOGLE_IDENTITY_ORIGIN}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(upgradeInsecureRequests ? ["upgrade-insecure-requests"] : []),
    ...(reportUri ? [`report-uri ${reportUri}`] : []),
  ];

  return directives.join("; ");
};
