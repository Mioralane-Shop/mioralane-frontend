/**
 * P1.4 Block C — the static half of the storefront's security headers.
 *
 * These four are the same for every request, so they live in the config and are
 * served by the platform. The CSP is NOT here: it carries a per-response nonce
 * and is set in `src/middleware.ts`.
 *
 * HSTS is deliberately absent — `https://mioralane.com` already answers with
 * `strict-transport-security: max-age=63072000` (Vercel adds it for custom
 * domains), and a second, weaker value here would only be something to get wrong
 * later. Verified with `curl -sSI`, not assumed.
 */
const securityHeaders = [
  // Clickjacking. `frame-ancestors 'none'` in the CSP is the modern control;
  // this stays for pre-CSP browsers.
  { key: "X-Frame-Options", value: "DENY" },
  // Stops a browser from re-interpreting a declared content type (e.g. a
  // user-uploaded `.txt` that is really HTML).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Full URLs leak to third parties only for same-origin destinations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The storefront uses none of these. An empty allowlist is the "deny" the
  // spec has no keyword for.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    /*
     * P1.5b — one host, ours, with a path.
     *
     * `next/image`'s optimizer fetches whatever URL it is given from a host in
     * this list, so the list IS an attack surface: GHSA-2xp9-vwfh-vxw4 (CVSS 9.5,
     * unauthenticated RCE in the image-optimizer path via libheif) is reachable
     * whenever an attacker can get a crafted image served from an allowed host.
     *
     * Seven hosts were allowlisted here and NONE of them is referenced anywhere in
     * `src/` (verified by grepping every source file, CSS and config): they were
     * left over from the scaffold's demo content —
     *   images.unsplash.com, encrypted-tbn0.gstatic.com, **.googleapis.com,
     *   picsum.photos, example.com, images.squarespace-cdn.com,
     *   skynellebeauty.com, lavishta.com
     * Removing them closes that precondition.
     *
     * The `pathname` is the other half, and it is not cosmetic: `ik.imagekit.io`
     * is a multi-tenant CDN, so a hostname-only pattern also allows an attacker's
     * own ImageKit account (`/_next/image?url=https://ik.imagekit.io/<theirs>/x.avif`).
     * Pinning it to our endpoint id (the same value as IMAGEKIT_URL_ENDPOINT)
     * limits the optimizer to media we uploaded.
     *
     * ⚠️ Corrected: this block used to say that an image URL stored on one of the
     * removed hosts "now renders ProductImage's placeholder". That was wrong, and
     * believing it is why the crash below shipped. `next/image`'s default loader
     * THROWS for a host that is not listed here
     * ("Invalid src prop (…) on `next/image`, hostname "…" is not configured"),
     * and a throw inside a client component removes the whole subtree — not just
     * the thumbnail. `CartDrawer` is mounted in the root layout, so ONE stored
     * unsplash URL in a cross-sell recommendation took out every route.
     *
     * The render path now gates stored image URLs before they reach `next/image`
     * (`src/lib/safe-image-src.ts`): anything that is not site-relative and not on
     * our endpoint shows the placeholder. `npm run verify:url-guard` asserts that
     * module's IMAGE_REMOTE_* constants still match this list, so the two cannot
     * drift — change them together, and never widen this list to "fix" a bad row.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/7sz3r4tou/**",
      },
    ],
  },
};

export default nextConfig;
