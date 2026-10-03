/**
 * P1.4 Block C — the storefront's security headers and Content Security Policy.
 *
 * Run with: npm run verify:headers
 *
 * The policy is not a document, it is a program: `buildCsp(nonce, options)` in
 * `src/lib/csp.ts`. So this harness calls the real function and reads the real
 * `next.config.mjs` / `src/middleware.ts` sources, rather than restating either.
 *
 * It covers:
 *
 *   A. `createNonce` — CSPRNG-backed (not `Math.random`), unique per response,
 *      and shaped like a legal `nonce-value`.
 *   B. the production policy: every directive, in order, with the nonce in the
 *      two places it belongs and `'unsafe-inline'` in none of them.
 *   C. the development policy, which differs on purpose (eval, inline styles,
 *      the local API, no `upgrade-insecure-requests`).
 *   D. `buildCsp` is pure, and the nonce is a required input.
 *   E. the static headers in `next.config.mjs`, and that the CSP is NOT there.
 *   F. `src/middleware.ts` — Report-Only only, nonce forwarded on the request,
 *      and a matcher that skips static assets.
 *   G. the policy covers what the app actually loads, read from the sources that
 *      load it (the Fontshare stylesheet, the ImageKit loader, Google Sign-In).
 *   H. controls: the pre-Block-C configuration, and a policy with no nonce, must
 *      both fail the same rules the real one passes.
 *   I. cross-repo parity with `mioralane-admin` when it is checked out beside
 *      this repository.
 *
 * Node runs this file as TypeScript by stripping types, so it must stay erasable
 * (no enums, no namespaces, no parameter properties) and import with explicit
 * `.ts` extensions — Node does not rewrite them.
 *
 * Exits non-zero if any check fails.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CSP_HEADER,
  CSP_REPORT_ONLY_HEADER,
  GOOGLE_IDENTITY_ORIGIN,
  FONTSHARE_FONT_ORIGIN,
  FONTSHARE_STYLESHEET_ORIGIN,
  IMAGEKIT_ORIGIN,
  buildCsp,
  createNonce,
} from "../src/lib/csp.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(HERE, "..");
const SRC = join(APP_ROOT, "src");

const CSP_MODULE_FILE = join(SRC, "lib", "csp.ts");
const MIDDLEWARE_FILE = join(SRC, "middleware.ts");
const NEXT_CONFIG_FILE = join(APP_ROOT, "next.config.mjs");
const LAYOUT_FILE = join(SRC, "app", "layout.tsx");
const IMAGEKIT_DELIVERY_FILE = join(SRC, "lib", "imagekit-delivery.ts");
const GOOGLE_PROVIDER_FILE = join(SRC, "providers", "google-auth-provider.tsx");
const AXIOS_FILE = join(SRC, "lib", "axios.ts");

const ADMIN_ROOT = join(APP_ROOT, "..", "mioralane-admin");
const ADMIN_CSP_MODULE_FILE = join(ADMIN_ROOT, "lib", "csp.ts");
const ADMIN_NEXT_CONFIG_FILE = join(ADMIN_ROOT, "next.config.ts");

/** The same value `src/middleware.ts` falls back to when the env var is unset. */
const PRODUCTION_API_ORIGIN = "https://mioralane-backend.vercel.app";
const DEVELOPMENT_API_ORIGIN = "http://localhost:5000";

const PRODUCTION_OPTIONS = {
  connectOrigins: [PRODUCTION_API_ORIGIN],
  allowEval: false,
  allowInlineStyles: false,
  upgradeInsecureRequests: true,
};

const DEVELOPMENT_OPTIONS = {
  connectOrigins: [PRODUCTION_API_ORIGIN, DEVELOPMENT_API_ORIGIN],
  allowEval: true,
  allowInlineStyles: true,
  upgradeInsecureRequests: false,
};

/**
 * The pre-Block-C configuration, verbatim: no `headers()` in `next.config.mjs`,
 * no middleware, no CSP. Used as the negative control for sections E and F.
 */
const PRE_BLOCK_C_NEXT_CONFIG = [
  '/** @type {import("next").NextConfig} */',
  "const nextConfig = {",
  "  images: {",
  "    remotePatterns: [],",
  "  },",
  "};",
  "",
  "export default nextConfig;",
].join("\n");

/**
 * A plausible "we set a CSP" mistake: a wildcard policy with a nonce-less
 * `script-src` that permits inline script. Section H feeds it to the same rules
 * the real policy passes.
 */
const INLINE_SCRIPT_POLICY = [
  "default-src *",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src *",
].join("; ");

const failures: string[] = [];

const check = (label: string, condition: boolean, detail?: string): void => {
  if (condition) {
    console.log(`  OK   ${label}`);
    return;
  }

  const suffix = detail ? ` — ${detail}` : "";
  console.log(`  FAIL ${label}${suffix}`);
  failures.push(`${label}${suffix}`);
};

const section = (title: string): void => {
  console.log(`\n=== ${title} ===`);
};

/**
 * Strips comment-ONLY lines so the structural rules read code, not prose.
 *
 * `src/lib/csp.ts` documents every origin it allows and `middleware.ts`
 * documents the header it does *not* set, so a raw text search would match the
 * documentation — the trap the P1.1 harness fell into.
 */
const stripCommentLines = (source: string): string =>
  source
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();

      return !(
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("*/")
      );
    })
    .join("\n");

const readSource = (file: string): string => stripCommentLines(readFileSync(file, "utf8"));

/** `default-src 'self'; script-src …` -> directive name to its source list. */
const parsePolicy = (policy: string): Map<string, string[]> => {
  const directives = new Map<string, string[]>();
  const parts = policy.split(";");

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index].trim();
    if (part.length === 0) continue;

    const space = part.indexOf(" ");
    const name = space === -1 ? part : part.slice(0, space);
    const value = space === -1 ? "" : part.slice(space + 1);

    directives.set(name, value.length === 0 ? [] : value.split(" "));
  }

  return directives;
};

const sourcesOf = (policy: string, directive: string): string[] =>
  parsePolicy(policy).get(directive) ?? [];

const hasSource = (policy: string, directive: string, source: string): boolean =>
  sourcesOf(policy, directive).includes(source);

/** Every host an `<a href>`/`<link href>` in a source file points at. */
const absoluteHrefs = (source: string): string[] => {
  const pattern = /href="(https:\/\/[^"]+)"/g;
  const found: string[] = [];
  let match = pattern.exec(source);

  while (match !== null) {
    found.push(match[1]);
    match = pattern.exec(source);
  }

  return found;
};

interface PolicyExpectations {
  nonce: string;
  connectOrigins: readonly string[];
  allowEval: boolean;
  allowInlineStyles: boolean;
  upgradeInsecureRequests: boolean;
  reportUri?: string;
}

/**
 * The rules the policy must satisfy, as data.
 *
 * Returned as a list of violations rather than a boolean so the same rules can
 * judge the real policy (expect: none) and the controls (expect: some), which is
 * what makes those controls evidence instead of decoration.
 */
const policyViolations = (policy: string, expectations: PolicyExpectations): string[] => {
  const violations: string[] = [];
  const directives = parsePolicy(policy);

  const require = (condition: boolean, message: string): void => {
    if (!condition) violations.push(message);
  };

  const ordered = [
    "default-src",
    "base-uri",
    "object-src",
    "frame-ancestors",
    "form-action",
    "script-src",
    "style-src",
    "font-src",
    "img-src",
    "connect-src",
    "frame-src",
    "worker-src",
    "manifest-src",
  ];

  for (const name of ordered) {
    require(directives.has(name), `missing directive ${name}`);
  }

  const nonceToken = `'nonce-${expectations.nonce}'`;

  require(expectations.nonce.length > 0, "the nonce is empty, so the policy grants nothing");
  require(
    hasSource(policy, "script-src", nonceToken),
    `script-src must carry ${nonceToken}`
  );
  require(
    hasSource(policy, "script-src", "'strict-dynamic'"),
    "script-src must carry 'strict-dynamic'"
  );
  require(
    hasSource(policy, "script-src", "'self'"),
    "script-src must keep 'self' for CSP2 browsers without 'strict-dynamic'"
  );
  require(
    !sourcesOf(policy, "script-src").includes("'unsafe-inline'"),
    "script-src must not allow 'unsafe-inline'"
  );
  require(
    sourcesOf(policy, "script-src").includes("'unsafe-eval'") === expectations.allowEval,
    `script-src 'unsafe-eval' must be ${expectations.allowEval ? "present" : "absent"}`
  );

  if (expectations.allowInlineStyles) {
    // `'unsafe-inline'` is ignored when a nonce is present in the same
    // directive, so the dev policy must not list both.
    require(
      hasSource(policy, "style-src", "'unsafe-inline'"),
      "the development style-src must allow 'unsafe-inline'"
    );
    require(
      !sourcesOf(policy, "style-src").includes(nonceToken),
      "the development style-src must not also carry a nonce (it would void 'unsafe-inline')"
    );
  } else {
    require(
      hasSource(policy, "style-src", nonceToken),
      `style-src must carry ${nonceToken}`
    );
    require(
      !sourcesOf(policy, "style-src").includes("'unsafe-inline'"),
      "style-src must not allow 'unsafe-inline'"
    );
  }

  require(
    hasSource(policy, "default-src", "'self'"),
    "default-src must be 'self', not a wildcard"
  );

  // `Array.from` rather than a `for…of` over the Map: this app compiles at ES5,
  // where iterating a Map needs `downlevelIteration`.
  const wildcards: string[] = [];
  const names = Array.from(directives.keys());
  for (let index = 0; index < names.length; index += 1) {
    const name = names[index];
    if ((directives.get(name) ?? []).includes("*")) wildcards.push(name);
  }
  require(
    wildcards.length === 0,
    `no directive may use a bare wildcard (found in: ${wildcards.join(", ")})`
  );
  require(
    hasSource(policy, "img-src", "https://*.googleusercontent.com") ||
      sourcesOf(policy, "img-src").indexOf("https:") !== -1,
    "img-src must cover the Google avatar host (subdomain wildcards are not bare wildcards)"
  );

  for (const source of expectations.connectOrigins) {
    require(
      hasSource(policy, "connect-src", source),
      `connect-src must allow the API origin ${source}`
    );
  }

  require(
    hasSource(policy, "connect-src", "'self'"),
    "connect-src must allow same-origin requests"
  );
  require(
    sourcesOf(policy, "connect-src").includes("http://localhost:5000") ===
      expectations.allowInlineStyles,
    "the local API origin belongs to the development policy only"
  );

  require(
    directives.get("frame-ancestors")?.join(" ") === "'none'",
    "frame-ancestors must be 'none' (the modern clickjacking control)"
  );
  require(
    directives.get("object-src")?.join(" ") === "'none'",
    "object-src must be 'none'"
  );
  require(
    directives.get("base-uri")?.join(" ") === "'self'",
    "base-uri must be 'self'"
  );
  require(
    directives.get("form-action")?.join(" ") === "'self'",
    "form-action must be 'self'"
  );

  require(
    hasSource(policy, "font-src", FONTSHARE_FONT_ORIGIN),
    `font-src must allow ${FONTSHARE_FONT_ORIGIN} (the Fontshare @font-face files)`
  );
  require(
    hasSource(policy, "style-src", FONTSHARE_STYLESHEET_ORIGIN),
    `style-src must allow ${FONTSHARE_STYLESHEET_ORIGIN} (the Satoshi stylesheet)`
  );

  // Google Sign-In: script, stylesheet, iframe and XHR.
  require(
    hasSource(policy, "script-src", GOOGLE_IDENTITY_ORIGIN),
    "script-src must allow Google Identity Services (CSP2 fallback)"
  );
  require(
    hasSource(policy, "style-src", GOOGLE_IDENTITY_ORIGIN),
    "style-src must allow the GSI stylesheet link"
  );
  require(
    hasSource(policy, "frame-src", GOOGLE_IDENTITY_ORIGIN),
    "frame-src must allow the GSI button iframe"
  );
  require(
    hasSource(policy, "connect-src", GOOGLE_IDENTITY_ORIGIN),
    "connect-src must allow GSI's XHR traffic"
  );

  require(
    hasSource(policy, "img-src", "data:") && hasSource(policy, "img-src", "blob:"),
    "img-src must allow data: and blob:"
  );

  require(
    directives.has("upgrade-insecure-requests") === expectations.upgradeInsecureRequests,
    `upgrade-insecure-requests must be ${
      expectations.upgradeInsecureRequests ? "present" : "absent"
    }`
  );

  const reportUri = directives.get("report-uri");
  if (expectations.reportUri) {
    require(
      reportUri !== undefined && reportUri.join(" ") === expectations.reportUri,
      "the configured report-uri must be emitted verbatim"
    );
  } else {
    require(
      reportUri === undefined,
      "no report-uri may be emitted when no collector is configured"
    );
  }

  return violations;
};

const main = (): void => {
  /* ── A. The nonce ──────────────────────────────────────────────────── */
  section("A. createNonce — CSPRNG-backed, unique, legal nonce-value");

  const nonce = createNonce();
  const nonces = new Set<string>();
  for (let index = 0; index < 1000; index += 1) {
    nonces.add(createNonce());
  }

  check("returns a base64 string of 16 bytes (24 chars, '==' padded)", /^[A-Za-z0-9+/]{22}==$/.test(nonce), `got ${nonce}`);
  check("1000 calls produce 1000 distinct nonces", nonces.size === 1000, `got ${nonces.size}`);
  check("the nonce contains no whitespace or ';' (it is spliced into a policy)", !/[;\s]/.test(nonce));

  const cspModuleSource = readSource(CSP_MODULE_FILE);
  check(
    "the nonce comes from Web Crypto, not Math.random",
    /crypto\.getRandomValues\(/.test(cspModuleSource) && !/Math\.random/.test(cspModuleSource),
    "a guessable nonce is the same as no nonce"
  );
  check(
    "the module imports nothing (the harness and the Edge runtime both load it)",
    !/^\s*import\b/m.test(cspModuleSource),
    "an import would break the type-stripped harness"
  );

  /* ── B. The production policy ──────────────────────────────────────── */
  section("B. The shipped policy, directive by directive");

  const production = buildCsp(nonce, PRODUCTION_OPTIONS);
  const productionViolations = policyViolations(production, { nonce, ...PRODUCTION_OPTIONS });
  const productionDirectives = parsePolicy(production);

  check(
    "the production policy satisfies every rule",
    productionViolations.length === 0,
    productionViolations.join(" | ")
  );
  check(
    "directive order is stable (a diff of the policy stays readable)",
    Array.from(productionDirectives.keys()).join(",") ===
      "default-src,base-uri,object-src,frame-ancestors,form-action,script-src,style-src,font-src,img-src,connect-src,frame-src,worker-src,manifest-src,upgrade-insecure-requests"
  );
  check(
    "the nonce appears in script-src and style-src, and nowhere else",
    production.split(`'nonce-${nonce}'`).length - 1 === 2,
    `found ${production.split(`'nonce-${nonce}'`).length - 1}`
  );
  check(
    "worker-src allows blob: (Next spawns workers from blob URLs)",
    hasSource(production, "worker-src", "'self'") && hasSource(production, "worker-src", "blob:")
  );
  check(
    "img-src allows the ImageKit origin the custom next/image loader requests",
    hasSource(production, "img-src", IMAGEKIT_ORIGIN)
  );
  check(
    "no 'unsafe-inline' anywhere in the production policy",
    !production.includes("'unsafe-inline'")
  );
  check(
    "no report-uri is emitted when no collector is configured",
    !productionDirectives.has("report-uri")
  );

  /* ── C. The development policy ─────────────────────────────────────── */
  section("C. The development policy, which differs on purpose");

  const development = buildCsp(nonce, DEVELOPMENT_OPTIONS);
  const developmentViolations = policyViolations(development, { nonce, ...DEVELOPMENT_OPTIONS });

  check("the development policy satisfies every rule", developmentViolations.length === 0, developmentViolations.join(" | "));
  check("development allows 'unsafe-eval' (webpack's eval source maps)", hasSource(development, "script-src", "'unsafe-eval'"));
  check("development allows inline styles (Next's HMR style tags)", hasSource(development, "style-src", "'unsafe-inline'"));
  check("development does NOT upgrade insecure requests (it *is* http)", !parsePolicy(development).has("upgrade-insecure-requests"));
  check("development allows the local API origin", hasSource(development, "connect-src", DEVELOPMENT_API_ORIGIN));
  check("development does NOT contain 'unsafe-inline' in script-src", !hasSource(development, "script-src", "'unsafe-inline'"));

  /* ── D. Purity ─────────────────────────────────────────────────────── */
  section("D. buildCsp is pure, and the nonce is load-bearing");

  check(
    "the same arguments produce the same string (twice in a row)",
    buildCsp(nonce, PRODUCTION_OPTIONS) === production
  );
  check(
    "a different nonce produces a different policy",
    buildCsp(createNonce(), PRODUCTION_OPTIONS) !== production
  );
  check(
    "an empty nonce is refused by the rules (the nonce rule is live)",
    policyViolations(buildCsp("", PRODUCTION_OPTIONS), { nonce: "", ...PRODUCTION_OPTIONS }).length > 0
  );
  const originsBefore = PRODUCTION_OPTIONS.connectOrigins.join(",");
  buildCsp(nonce, PRODUCTION_OPTIONS);
  check(
    "buildCsp does not mutate the options it is given (the caller's array survives)",
    PRODUCTION_OPTIONS.connectOrigins.join(",") === originsBefore
  );

  /* ── E. The static half: next.config.mjs ───────────────────────────── */
  section("E. next.config.mjs — the static headers");

  const nextConfig = readSource(NEXT_CONFIG_FILE);
  const expectedHeaders: [string, string][] = [
    ["X-Frame-Options", "DENY"],
    ["X-Content-Type-Options", "nosniff"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
  ];

  check("next.config.mjs is read as code (comments stripped)", nextConfig.length > 0);

  for (const [key, value] of expectedHeaders) {
    check(
      `sets ${key}`,
      new RegExp(`key:\\s*"${key}"[\\s\\S]{0,80}?value:\\s*"${value.replace(/[()*,]/g, "\\$&")}"`).test(nextConfig),
      "the value must match exactly"
    );
  }

  check(
    "does NOT set Strict-Transport-Security (Vercel already serves it)",
    !/Strict-Transport-Security/i.test(nextConfig)
  );
  check(
    "does NOT set a Content-Security-Policy (the nonce is per-response)",
    !/Content-Security-Policy/i.test(nextConfig)
  );
  check(
    "applies them to every path",
    /source:\s*"\/\(\.\*\)"/.test(nextConfig)
  );

  /* ── F. The per-response half: src/middleware.ts ───────────────────── */
  section("F. src/middleware.ts — Report-Only, nonce forwarded, assets skipped");

  const middlewareSource = readSource(MIDDLEWARE_FILE);

  check("imports the policy from the pure module", /from "@\/lib\/csp"/.test(middlewareSource));
  check("creates exactly one nonce per response", (middlewareSource.match(/createNonce\(\)/g) ?? []).length === 1);
  check(
    "ships the policy as Content-Security-Policy-Report-Only",
    /response\.headers\.set\(CSP_REPORT_ONLY_HEADER,\s*policy\)/.test(middlewareSource)
  );
  check(
    "forwards the policy on the REQUEST so Next can stamp the nonce",
    /requestHeaders\.set\(CSP_HEADER,\s*policy\)/.test(middlewareSource) &&
      /NextResponse\.next\(\{\s*request:\s*\{\s*headers:\s*requestHeaders\s*\}\s*\}\)/.test(middlewareSource)
  );
  check(
    "never sets an enforcing Content-Security-Policy on a response",
    !/response\.headers\.set\(\s*CSP_HEADER\b/.test(middlewareSource) &&
      !/headers\.set\(\s*"Content-Security-Policy"/.test(middlewareSource),
    "Block C must stay report-only for the 7-day window"
  );
  check(
    "derives the API origin from NEXT_PUBLIC_API_URL, like lib/axios.ts does",
    /process\.env\.NEXT_PUBLIC_API_URL/.test(middlewareSource) &&
      /process\.env\.NEXT_PUBLIC_API_URL/.test(readSource(AXIOS_FILE))
  );
  check(
    "keeps a production API fallback for a build with no .env",
    middlewareSource.includes(`"${PRODUCTION_API_ORIGIN}"`)
  );
  check(
    "the local API origin is development-only",
    /isDevelopment \? \[DEVELOPMENT_API_ORIGIN\]/.test(middlewareSource)
  );
  check("exports a matcher", /export const config\b/.test(middlewareSource) && /matcher:/.test(middlewareSource));
  check(
    "the matcher skips Next's immutable build output and static images",
    /_next\/static/.test(middlewareSource) && /_next\/image/.test(middlewareSource)
  );
  check(
    "the matcher does not skip _next/data (RSC payloads carry the same contract)",
    !middlewareSource.includes("_next/data")
  );
  check(
    "the CSP header names come from the shared module, not from string literals",
    /CSP_HEADER,\s*CSP_REPORT_ONLY_HEADER/.test(middlewareSource)
  );
  check(
    "CSP_REPORT_ONLY_HEADER really is the Report-Only header",
    CSP_REPORT_ONLY_HEADER === "Content-Security-Policy-Report-Only"
  );
  check("CSP_HEADER really is the enforcing header name", CSP_HEADER === "Content-Security-Policy");

  /* ── G. The policy must cover what the app loads ───────────────────── */
  section("G. The policy covers the origins the app actually requests");

  const layoutSource = readSource(LAYOUT_FILE);
  const score = absoluteHrefs(layoutSource);

  check(
    "the root layout loads an external stylesheet (this is why style-src is not 'self'-only)",
    score.length > 0 && /rel="stylesheet"/.test(layoutSource),
    `found ${JSON.stringify(score)}`
  );

  for (const href of score) {
    const origin = new URL(href).origin;
    check(
      `style-src allows ${origin} (declared in src/app/layout.tsx)`,
      hasSource(production, "style-src", origin),
      "an external stylesheet is a style-src source, not a font-src one"
    );
  }

  const imagekitHostMatch = /IMAGEKIT_HOSTNAME\s*=\s*"([^"]+)"/.exec(readSource(IMAGEKIT_DELIVERY_FILE));

  check("the ImageKit host is declared by the custom loader", imagekitHostMatch !== null, "src/lib/imagekit-delivery.ts");
  if (imagekitHostMatch) {
    check(
      `img-src allows https://${imagekitHostMatch[1]} (ProductImage requests it directly)`,
      hasSource(production, "img-src", `https://${imagekitHostMatch[1]}`)
    );
  }
  check(
    "font-src allows the Fontshare font CDN, not just the stylesheet host",
    hasSource(production, "font-src", FONTSHARE_FONT_ORIGIN),
    "the @font-face files are served from cdn.fontshare.com (verified against the live CSS)"
  );

  const googleProvider = readSource(GOOGLE_PROVIDER_FILE);
  check(
    "the app mounts Google Sign-In (three directives depend on it)",
    /@react-oauth\/google/.test(googleProvider)
  );
  check(
    "Google Sign-In keeps its script, frame and connect sources",
    hasSource(production, "script-src", GOOGLE_IDENTITY_ORIGIN) &&
      hasSource(production, "frame-src", GOOGLE_IDENTITY_ORIGIN) &&
      hasSource(production, "connect-src", GOOGLE_IDENTITY_ORIGIN)
  );
  check(
    "frame-ancestors is unrelated to frame-src (we are never framed)",
    parsePolicy(production).get("frame-ancestors")?.join(" ") === "'none'"
  );

  /* ── H. Controls ──────────────────────────────────────────────────── */
  section("H. Controls: the pre-Block-C shapes must fail these rules");

  const controlViolations = policyViolations(INLINE_SCRIPT_POLICY, {
    nonce,
    connectOrigins: [PRODUCTION_API_ORIGIN],
    allowEval: false,
    allowInlineStyles: false,
    upgradeInsecureRequests: true,
  });

  check(
    "control: a nonce-less, 'unsafe-inline' script policy is rejected",
    controlViolations.length > 0,
    "if this passes, the section B rules measure nothing"
  );
  check(
    "control: and it is rejected for the nonce and unsafe-inline reasons specifically",
    controlViolations.some((violation) => violation.includes("nonce")) &&
      controlViolations.some((violation) => violation.includes("unsafe-inline"))
  );
  check(
    "control: it is also rejected for missing directives",
    controlViolations.some((violation) => violation.startsWith("missing directive"))
  );
  check(
    "control: the pre-Block-C next.config.mjs has no headers() at all",
    !/headers\s*\(/.test(stripCommentLines(PRE_BLOCK_C_NEXT_CONFIG)),
    "the section E rules would find nothing to check"
  );
  check(
    "control: the section E rule does reject that file",
    !expectedHeaders.every(([key]) => new RegExp(`key:\\s*"${key}"`).test(stripCommentLines(PRE_BLOCK_C_NEXT_CONFIG)))
  );
  check(
    "control: an enforcing response header is caught by the section F rule",
    /response\.headers\.set\(\s*CSP_HEADER\b/.test('response.headers.set(CSP_HEADER, policy);'),
    "the rule must be sensitive to the header it forbids"
  );
  check(
    "control: the report-only rule is not satisfied by the request-header line alone",
    !/response\.headers\.set\(CSP_REPORT_ONLY_HEADER,\s*policy\)/.test(
      "requestHeaders.set(CSP_HEADER, policy);"
    )
  );

  /* ── I. Cross-repo parity ──────────────────────────────────────────── */
  section("I. Cross-repo: the two client policies stay one shape");

  if (!existsSync(ADMIN_CSP_MODULE_FILE) || !existsSync(ADMIN_NEXT_CONFIG_FILE)) {
    console.log(
      "  SKIP mioralane-admin is not checked out beside this repository, so the two\n" +
        "       policies could not be compared. Everything above is the CI-enforced half."
    );
  } else {
    const adminSource = readSource(ADMIN_CSP_MODULE_FILE);
    const adminNextConfig = readSource(ADMIN_NEXT_CONFIG_FILE);

    check(
      "both modules declare the same header constants",
      adminSource.includes('export const CSP_HEADER = "Content-Security-Policy"') &&
        adminSource.includes('export const CSP_REPORT_ONLY_HEADER = "Content-Security-Policy-Report-Only"')
    );

    // A directive entry is either a plain string (`"img-src …"`) or a template
    // literal (`` `script-src ${…}` ``), so both quote characters open a name.
    const directiveEntry = /["`](default-src|base-uri|object-src|frame-ancestors|form-action|script-src|style-src|font-src|img-src|connect-src|frame-src|worker-src|manifest-src)\b/;

    const adminDirectiveNames = /const directives: string\[\] = \[([\s\S]*?)\n {2}\];/
      .exec(adminSource)?.[1]
      .split("\n")
      .map((line) => directiveEntry.exec(line.trim())?.[1])
      .filter((name): name is string => Boolean(name)) ?? [];

    check(
      "both build the same directive list, in the same order",
      adminDirectiveNames.join(",") ===
        "default-src,base-uri,object-src,frame-ancestors,form-action,script-src,style-src,font-src,img-src,connect-src,frame-src,worker-src,manifest-src",
      `admin: ${adminDirectiveNames.join(",")}`
    );
    check(
      "both set the same four static headers with the same values",
      expectedHeaders.every(
        ([key, value]) => adminNextConfig.includes(`key: "${key}"`) && adminNextConfig.includes(`value: "${value}"`)
      ) && !/Strict-Transport-Security/i.test(adminNextConfig)
    );
    check(
      "the admin policy is the looser one only in img-src (stored URLs are https-only)",
      /"img-src 'self' data: blob: https:"/.test(adminSource)
    );
    check(
      "the storefront is NOT loosened the same way (its image hosts are enumerable)",
      !sourcesOf(production, "img-src").includes("https:"),
      `frontend img-src: ${sourcesOf(production, "img-src").join(" ")}`
    );
    check(
      "neither policy adds a bare wildcard to a script or connect directive",
      !sourcesOf(production, "script-src").includes("*") && !production.includes("connect-src *")
    );
  }

  /* ── Result ────────────────────────────────────────────────────────── */
  console.log("\n=== Result ===");

  if (failures.length > 0) {
    console.log(`FAILED (${failures.length}):`);
    for (const failure of failures) {
      console.log(`  - ${failure}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("All security-header checks passed.");
};

void main();
