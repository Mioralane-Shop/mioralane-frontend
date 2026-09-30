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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "https",
        hostname: "skynellebeauty.com",
      },
      {
        protocol: "https",
        hostname: "lavishta.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

export default nextConfig;
