/**
 * P1.4 Block C — the storefront's security headers.
 *
 * Two halves, split by where the value has to be computed:
 *
 *   - `next.config.mjs` `headers()` sets the static headers (X-Frame-Options,
 *     X-Content-Type-Options, Referrer-Policy, Permissions-Policy). They are the
 *     same for every request, so they belong in the config and cost nothing.
 *   - this file sets the CSP, which cannot be static: it carries a per-response
 *     nonce, and Next.js only stamps that nonce onto its own inline scripts when
 *     it can read the policy back off the *request* headers (see below).
 *
 * SHIPPED AS `Content-Security-Policy-Report-Only` — **permanently**. This is a
 * decision, not a staging step (2026-09-30, recorded in
 * `/memories/repo/mioralane-security-headers.md`), so do not "finish the job" by
 * swapping in the enforcing header.
 *
 * WHY NOT ENFORCE — measured, not assumed. A nonce can only be stamped onto HTML
 * rendered per request, so Next applies it to the 6 SSR routes (`/login`,
 * `/register`, `/product/[slug]`, `/combo/[slug]`, `/blog/[slug]`,
 * `/order-success/[id]`) and to none of the 21 prerendered ones (`/`, `/shop`,
 * `/cart`, …); `grep 'nonce="' .next/server/app/index.html` is empty after a
 * build. With `'strict-dynamic'` a CSP3 browser ignores `'self'`, so enforcing
 * `script-src 'self' 'nonce-…' 'strict-dynamic'` would block every
 * `/_next/static` chunk on those routes and take the storefront down. Forcing
 * them dynamic instead would multiply TTFB on a static, revenue-bearing
 * storefront — a worse trade than a monitored policy.
 *
 * The monitoring is not the only control: the stored-URL guards (blocks A/B), the
 * four static headers, and the `verify:no-html-sinks` CI invariant each hold on
 * their own. `CSP_REPORT_URI` is the opt-in path to a real collector if a
 * violation ever shows up (see the README, and the P1.6 backlog).
 *
 * HSTS is deliberately absent: `https://mioralane.com` already returns
 * `strict-transport-security: max-age=63072000` (Vercel), and re-declaring it
 * from here would only create a second, weaker value to reason about.
 */
import { NextResponse, type NextRequest } from "next/server";
import { CSP_HEADER, CSP_REPORT_ONLY_HEADER, buildCsp, createNonce } from "@/lib/csp";

/**
 * The API this build talks to when `NEXT_PUBLIC_API_URL` is not configured.
 *
 * `NEXT_PUBLIC_API_URL` is inlined at build time, and a CI build has no `.env`
 * at all — so without this constant a preview built by CI would produce a policy
 * that blocks every API call. Also serves as the production value, which is what
 * the variable already holds.
 */
const PRODUCTION_API_ORIGIN = "https://mioralane-backend.vercel.app";

/** Local API, development only. The customer app runs on :3000 per the CORS allowlist. */
const DEVELOPMENT_API_ORIGIN = "http://localhost:5000";

/** `https://host/path` -> `https://host`. A malformed value is dropped, never guessed. */
const readOrigin = (value: string | undefined): string[] => {
  if (!value) return [];

  try {
    return [new URL(value).origin];
  } catch {
    return [];
  }
};

export function middleware(request: NextRequest): NextResponse {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const nonce = createNonce();

  const policy = buildCsp(nonce, {
    connectOrigins: [
      ...readOrigin(process.env.NEXT_PUBLIC_API_URL),
      PRODUCTION_API_ORIGIN,
      ...(isDevelopment ? [DEVELOPMENT_API_ORIGIN] : []),
    ],
    allowEval: isDevelopment,
    allowInlineStyles: isDevelopment,
    upgradeInsecureRequests: !isDevelopment,
    reportUri: process.env.CSP_REPORT_URI,
  });

  /*
   * The request header is what makes the nonce real: Next.js reads the nonce out
   * of the `Content-Security-Policy` request header and adds `nonce="…"` to
   * every script tag it renders. Without it the policy below would report every
   * Next bootstrap script as a violation and the observation window would be
   * worthless.
   *
   * Consequence, accepted: a nonce-bearing page cannot be static, so this makes
   * the App Router render routes dynamically. That is inherent to a nonce-based
   * CSP, not an accident of this wiring — and it is why a report-only run comes
   * first.
   */
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CSP_HEADER, policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Report-Only on the response. The enforcing header is NOT set anywhere in this
  // app: that is the whole point of Block C, and the harness asserts it.
  response.headers.set(CSP_REPORT_ONLY_HEADER, policy);

  return response;
}

export const config = {
  /*
   * Documents only. Static assets and the image optimiser are excluded because a
   * policy on a `.woff2` or an `/_next/image?...` response protects nothing, and
   * every excluded path is one fewer middleware invocation on the hot path.
   *
   * `_next/data` is intentionally NOT excluded: RSC payload requests carry the
   * same per-request nonce contract as the HTML they prefetch.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|logo/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|json|woff|woff2|ttf)$).*)",
  ],
};
