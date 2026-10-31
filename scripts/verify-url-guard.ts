/**
 * P1.4 Block B — the read-side stored-URL guard.
 *
 * Run with: npm run verify-url-guard
 *
 * Block A stopped the API from *storing* a URL that is not `https://` or a
 * site-relative path. It cannot reach rows written before it, so the storefront
 * applies the same rule where the value is rendered. This harness covers:
 *
 *   1. the predicate (`isSafeHref`, `safeHref`) over the same value table the
 *      backend harness uses. The table is duplicated on purpose — the two
 *      repositories share no code — so the two files must be edited together,
 *   2. the parts that are easy to get wrong: `//evil` (protocol-relative), `/\evil`
 *      (browsers normalise the backslash), `''`, whitespace, non-strings,
 *   3. the render sites, read from the source: every `href={…}` in either
 *      component is a value that came out of `safeHref`, and no stored field is
 *      bound to an `href`,
 *   4. controls: the pre-Block-B bindings are fed to those same source rules and
 *      must be rejected by them, and (when the backend is checked out beside this
 *      repository) the two predicates' edge-case clauses are compared.
 *
 * Node runs this file as TypeScript by stripping types, so it must stay erasable
 * (no enums, no namespaces, no parameter properties).
 *
 * Exits non-zero if any check fails.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isSafeHref, safeHref } from "../src/lib/safe-href.ts";
import {
  IMAGE_REMOTE_HOSTNAME,
  IMAGE_REMOTE_PATH_PREFIX,
  firstRenderableImageSrc,
  isRenderableImageSrc,
} from "../src/lib/safe-image-src.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "src");
const SAFE_HREF_FILE = join(SRC, "lib", "safe-href.ts");
const SAFE_IMAGE_SRC_FILE = join(SRC, "lib", "safe-image-src.ts");
const NEXT_CONFIG_FILE = join(HERE, "..", "next.config.mjs");
const PRODUCT_IMAGE_FILE = join(SRC, "components", "common", "product-image.tsx");
const PRODUCT_CARD_FILE = join(SRC, "components", "product", "product-card.tsx");
const PRODUCT_GALLERY_FILE = join(SRC, "components", "product", "product-gallery.tsx");
const HERO_SECTION_FILE = join(SRC, "components", "common", "hero-section.tsx");
// Products moved to `/product/[brand]/[slug]`; this is the same client component
// (and the same `RelatedThumb`), only at its nested address.
const PDP_FILE = join(SRC, "app", "(public)", "product", "[brand]", "[slug]", "page.tsx");
const CAMPAIGN_FILE = join(SRC, "components", "common", "promotion-campaign.tsx");
const ANNOUNCEMENT_FILE = join(SRC, "components", "layout", "announcement-bar.tsx");
const BRAND_NAVBAR_FILE = join(SRC, "components", "layout", "navbar.tsx");
const BRAND_MOBILE_MENU_FILE = join(SRC, "components", "layout", "mobile-menu.tsx");
const BRAND_CARD_FILE = join(SRC, "components", "brands", "brand-card.tsx");
const BRAND_MARQUEE_FILE = join(SRC, "components", "common", "brands-marquee.tsx");
const BACKEND_VALIDATION_FILE = join(
  HERE,
  "..",
  "..",
  "mioralane-backend",
  "src",
  "utils",
  "validation.ts"
);

/**
 * Values the guard must refuse.
 *
 * The same table as `tests/verify-url-safety.ts` in the backend, so the two
 * predicates cannot drift apart without one of the two harnesses saying so.
 */
const REJECTED_VALUES: { value: string; why: string }[] = [
  { value: "javascript:alert(1)", why: "the scheme this block exists for" },
  { value: "JaVaScRiPt:alert(1)", why: "mixed case must not slip past a prefix test" },
  { value: "   javascript:alert(1)", why: "leading whitespace, judged after trim()" },
  { value: "javascript:alert(document.domain)", why: "reads the real origin" },
  { value: "javascript:void(0)", why: "harmless-looking, still a scheme" },
  {
    value: "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    why: "base64-encoded HTML document",
  },
  { value: "data:text/html,<script>alert(1)</script>", why: "inline HTML document" },
  { value: "vbscript:msgbox(1)", why: "legacy script scheme" },
  { value: "//evil.example/x", why: "protocol-relative — inherits the page scheme" },
  { value: "///evil.example/x", why: "three slashes, still not a path" },
  { value: "//", why: "a bare protocol-relative prefix" },
  { value: "/\\evil.example/x", why: "backslash: browsers normalise it to a second slash" },
  { value: "evil.example/x", why: "neither absolute nor site-relative" },
  { value: "http://mioralane.com/shop", why: "plain http is refused by the agreed rule" },
  { value: "ftp://evil.example/x", why: "not an allowed scheme" },
  { value: "mailto:hi@example.com", why: "not a navigation target for these fields" },
  { value: "HTTPS://mioralane.com/shop", why: "case-sensitive comparison: known trade-off" },
];

const ACCEPTED_VALUES: { value: string; why: string }[] = [
  { value: "https://mioralane.com/shop", why: "canonical absolute URL" },
  {
    value: "https://ik.imagekit.io/mioralane/tr:w-800/product.webp",
    why: "the ImageKit transform URLs actually stored",
  },
  { value: "/shop", why: "site-relative path" },
  { value: "/", why: "the site root" },
  { value: "/x//y", why: "a double slash AFTER position 1 is an ordinary path" },
  { value: "/product/rosehip-oil?ref=popup#buy", why: "path with query and fragment" },
  { value: "", why: 'accepted by the predicate as "not supplied"' },
  { value: "   ", why: "whitespace only, trims to the empty string" },
];

/** Sources that must be rejected by the structural rules below. */
const PRE_BLOCK_B_PROMOTION = [
  "            {showLink && activeCampaign.popup.ctaUrl ? (",
  "              <Button asChild className=\"mt-4 w-full\">",
  "                <Link href={activeCampaign.popup.ctaUrl}>",
  "                  {activeCampaign.popup.ctaLabel || \"Shop Now\"}",
  "                </Link>",
  "              </Button>",
  "            ) : null}",
].join("\n");

const PRE_BLOCK_B_ANNOUNCEMENT = [
  "function MessageText({ text, url }: { text: string; url?: string }) {",
  "  if (!url) {",
  "    return <span>{text}</span>;",
  "  }",
  "",
  "  return (",
  "    <Link",
  "      href={url}",
  "      className=\"underline\"",
  "    >",
  "      {text}",
  "    </Link>",
  "  );",
  "}",
].join("\n");

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
 * Strips comment-ONLY lines, so the source rules read code and not prose.
 *
 * `src/lib/safe-href.ts` documents that it is import-free, and a raw text search
 * matches that documentation — the trap P1.1's harness fell into.
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

/**
 * Every expression bound to `href` in `source`.
 *
 * An `exec` loop rather than `matchAll` + spread: this app targets ES5, where a
 * spread of an iterator needs `downlevelIteration`. The pattern is created per
 * call so its `lastIndex` cannot leak between checks.
 */
const hrefExpressions = (source: string): string[] => {
  const pattern = /\bhref=\{([^}]*)\}/g;
  const expressions: string[] = [];
  let match = pattern.exec(source);

  while (match !== null) {
    expressions.push((match[1] ?? "").trim());
    match = pattern.exec(source);
  }

  return expressions;
};

/**
 * An `href` whose expression reads a stored URL field directly.
 *
 * Matches `href={url}` and `href={activeCampaign.popup.ctaUrl}`, not
 * `href={href}` or `href={ctaHref}`: the rule is about where the *stored* value
 * comes from, not about the local variable's name.
 */
const RAW_HREF_BINDING = /\bhref=\{[^}]*[Uu]rl[^}]*\}/;

/** The initializer that must produce a rendered href: a `safeHref(...)` call. */
const GUARDED_HREF_INITIALIZER = /const (?:href|ctaHref) = safeHref\(/;

/**
 * A stored image array indexed straight into `<Image src={…}>`.
 *
 * Both a `products.images[0]` and an `images[selected]` binding match. This is
 * the shape that produced the reported crash: `next/image`'s default loader
 * throws for a host absent from `images.remotePatterns`, so no `onError` can
 * catch it.
 */
const STORED_IMAGE_SRC_BINDING = /src=\{(?:p|product|item|images?)\b[^}]*\[/;

/** The exact value in the reported error — kept verbatim so the guard is measured
 *  against the real failure and not a stand-in. */
const REPORTED_CRASH_IMAGE_URL = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be";

/**
 * Image URLs `next/image` cannot load.
 *
 * The first entry is the reported crash. The ImageKit entry is the one that is
 * easy to get wrong: the hostname is multi-tenant, so the *pathname* is half the
 * allowlist, and a hostname-only check (`isImageKitUrl`) would let a stranger's
 * endpoint through.
 */
const UNRENDERABLE_IMAGE_VALUES: { value: string; why: string }[] = [
  { value: REPORTED_CRASH_IMAGE_URL, why: "the URL that crashed the cart drawer" },
  { value: "https://picsum.photos/seed/mioralane/800/800", why: "a host removed in P1.5b" },
  { value: "https://example.com/product.jpg", why: "a host removed in P1.5b" },
  { value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:x", why: "a host removed in P1.5b" },
  { value: "https://images.squarespace-cdn.com/content/v1/x.jpg", why: "a host removed in P1.5b" },
  { value: "https://skynellebeauty.com/media/x.jpg", why: "a host removed in P1.5b" },
  { value: "https://lavishta.com/cdn/x.jpg", why: "a host removed in P1.5b" },
  {
    value: "https://ik.imagekit.io/someoneelse/product.jpg",
    why: "ImageKit is multi-tenant: the hostname alone is not the allowlist",
  },
  {
    value: "https://ik.imagekit.io/7sz3r4tou",
    why: "the endpoint with no path segment — remotePatterns' /** needs the slash",
  },
  { value: "http://ik.imagekit.io/7sz3r4tou/product.jpg", why: "the pattern pins the https protocol" },
  { value: "//evil.example/product.jpg", why: "protocol-relative reads as another host" },
  { value: "/\\evil.example/product.jpg", why: "backslash normalises to a second slash" },
  { value: "images/hero.jpg", why: "neither absolute nor site-relative" },
  { value: "javascript:alert(1)", why: "not an image" },
  { value: "data:image/png;base64,iVBORw0KGgo=", why: "not in remotePatterns" },
  { value: "blob:https://mioralane.com/6f1e", why: "not in remotePatterns" },
  { value: "https://images.unsplash.com", why: "bare host, no path" },
  { value: "", why: "not supplied" },
  { value: "   ", why: "whitespace only" },
];

/** Image URLs `next/image` can load, so the guard must not downgrade them. */
const RENDERABLE_IMAGE_VALUES: { value: string; why: string }[] = [
  { value: "/images/cosrx-snail.jpg", why: "a site-relative path is served from public/, no host check" },
  { value: "/", why: "the site root" },
  { value: "/images/a//b.jpg", why: "a double slash after position 1 is an ordinary path" },
  { value: "/logo/logo_icon.svg", why: "the logo the layout points at" },
  { value: "https://ik.imagekit.io/7sz3r4tou/products/serum.jpg", why: "our endpoint" },
  {
    value: "https://ik.imagekit.io/7sz3r4tou/tr:w-800/products/serum.webp",
    why: "the transformation URLs actually stored",
  },
  {
    value: "https://ik.imagekit.io/7sz3r4tou/products/serum.jpg?updatedAt=1730000000000",
    why: "ImageKit appends updatedAt; the pattern ignores the query",
  },
  { value: "  /images/hero.jpg  ", why: "trimmed before judging" },
  {
    value: "/brands/COSRX.svg",
    why: "a brand logo: the API stores these as site-relative paths (see the seed)",
  },
  {
    value: "/brands/AXIS-Y.svg",
    why: "and one whose file name is mixed-case, which is NOT the brand's slug",
  },
];

const main = (): void => {
  /* ── A. The predicate ──────────────────────────────────────────────── */
  section("A. The predicate, over the backend's value table");

  for (const { value, why } of REJECTED_VALUES) {
    check(`isSafeHref refuses ${JSON.stringify(value)}`, !isSafeHref(value), why);
    check(`safeHref returns null for ${JSON.stringify(value)}`, safeHref(value) === null, why);
  }

  for (const { value, why } of ACCEPTED_VALUES) {
    check(`isSafeHref accepts ${JSON.stringify(value)}`, isSafeHref(value), why);
  }

  for (const { value } of ACCEPTED_VALUES) {
    const expected = value.trim() === "" ? null : value.trim();

    check(
      `safeHref renders ${JSON.stringify(value)} as ${JSON.stringify(expected)}`,
      safeHref(value) === expected,
      `got ${JSON.stringify(safeHref(value))}`
    );
  }

  /* ── B. Edges the table cannot express ─────────────────────────────── */
  section("B. Edges: non-strings, the empty-string asymmetry, trimming");

  check(
    "non-strings are refused, not coerced",
    !isSafeHref(undefined) && !isSafeHref(null) && !isSafeHref(123) && !isSafeHref({}),
    "only a string may become an href"
  );
  check(
    "safeHref returns null for non-strings",
    safeHref(undefined) === null && safeHref(null) === null && safeHref(123) === null
  );
  check(
    'the empty string is accepted by the predicate but NOT rendered ("not supplied")',
    isSafeHref("") && safeHref("") === null,
    "an empty href is still an anchor, so nothing may be rendered for it"
  );
  check(
    "a whitespace-only value is treated as not supplied",
    isSafeHref("   ") && safeHref("   ") === null
  );
  check(
    "the rendered value is the trimmed one, so the href is what was checked",
    safeHref("  /shop  ") === "/shop" && safeHref("  https://mioralane.com/x  ") === "https://mioralane.com/x",
    `got ${JSON.stringify(safeHref("  /shop  "))}`
  );

  /* ── C. The render sites ───────────────────────────────────────────── */
  section("C. Every rendered href comes out of the guard");

  const sites: { label: string; file: string; allowed: string }[] = [
    { label: "promotion-campaign", file: CAMPAIGN_FILE, allowed: "ctaHref" },
    { label: "announcement-bar", file: ANNOUNCEMENT_FILE, allowed: "href" },
  ];

  for (const { label, file, allowed } of sites) {
    const source = readSource(file);
    const expressions = hrefExpressions(source);

    check(`${label}: imports the shared guard`, /from "@\/lib\/safe-href"/.test(source));
    check(`${label}: binds its href from safeHref(...)`, GUARDED_HREF_INITIALIZER.test(source));
    check(`${label}: still renders at least one href`, expressions.length > 0, `found ${expressions.length}`);
    check(
      `${label}: every href expression is the vetted local (\`${allowed}\`)`,
      expressions.length > 0 && expressions.every((expression) => expression === allowed),
      `expressions: ${JSON.stringify(expressions)}`
    );
    check(
      `${label}: no stored field is bound to an href`,
      !RAW_HREF_BINDING.test(source),
      "a raw binding is the pre-Block-B shape"
    );
  }

  const guardSource = readSource(SAFE_HREF_FILE);
  check("the guard itself is import-free", !/^\s*import\b/m.test(guardSource), "it must stay callable anywhere");
  check("the guard exports both the predicate and the renderer", /export const isSafeHref/.test(guardSource) && /export const safeHref/.test(guardSource));

  /* ── D. Controls ───────────────────────────────────────────────────── */
  section("D. Controls: the pre-Block-B sources must fail these rules");

  for (const [label, source] of [
    ["promotion-campaign", PRE_BLOCK_B_PROMOTION],
    ["announcement-bar", PRE_BLOCK_B_ANNOUNCEMENT],
  ] as const) {
    check(
      `control: the old ${label} binding is caught by the raw-href rule`,
      RAW_HREF_BINDING.test(source),
      "if this passes, rule C is not measuring the binding"
    );
    check(
      `control: the old ${label} binding has no guarded initializer`,
      !GUARDED_HREF_INITIALIZER.test(source)
    );
    check(
      `control: the old ${label} href is not the vetted local`,
      hrefExpressions(source).some((expression) => expression !== "href" && expression !== "ctaHref"),
      `expressions: ${JSON.stringify(hrefExpressions(source))}`
    );
  }

  section("E. Cross-repo: the two predicates share their edge cases");

  if (!existsSync(BACKEND_VALIDATION_FILE)) {
    console.log(
      "  SKIP the backend is not checked out beside this repository, so the two predicates\n" +
        "       could not be compared. The value table above is the CI-enforced half."
    );
  } else {
    const backend = readSource(BACKEND_VALIDATION_FILE);
    const frontend = readSource(SAFE_HREF_FILE);

    check(
      "both accept the empty string",
      backend.includes("url === ''") && frontend.includes('url === ""')
    );
    check(
      "both allow only the https prefix",
      backend.includes("startsWith('https://')") && frontend.includes("startsWith(ALLOWED_SCHEME_PREFIX)")
    );
    check(
      "both refuse a slash at position 1 (protocol-relative)",
      backend.includes("url[1] !== '/'") && frontend.includes('url[1] !== "/"')
    );
    check(
      "both refuse a backslash at position 1",
      backend.includes("url[1] !== '\\\\'") && frontend.includes('url[1] !== "\\\\"')
    );
    check("both trim before judging", backend.includes(".trim()") && frontend.includes(".trim()"));
  }

  /* ── F. The image guard ────────────────────────────────────────────── */
  section("F. isRenderableImageSrc, over a value table");

  for (const { value, why } of UNRENDERABLE_IMAGE_VALUES) {
    check(`isRenderableImageSrc refuses ${JSON.stringify(value)}`, !isRenderableImageSrc(value), why);
  }

  for (const { value, why } of RENDERABLE_IMAGE_VALUES) {
    check(`isRenderableImageSrc accepts ${JSON.stringify(value)}`, isRenderableImageSrc(value), why);
  }

  /*
   * A site-relative path containing `..` is ACCEPTED, and that is intended rather
   * than a gap. This predicate answers one question — will `next/image`'s loader
   * throw for this value? — and for any site-relative path the answer is no. It is
   * not a traversal filter: resolving the path is the browser's job, and it
   * resolves same-origin, so `/brands/../etc/passwd` becomes a request for
   * `/etc/passwd` on our own host, which 404s and renders a broken image. Pinned
   * here so that behaviour is a decision on the record and nobody "fixes" it by
   * accident.
   */
  check(
    'the guard is a renderability predicate, not a traversal filter: a relative path with ".." passes',
    isRenderableImageSrc("/brands/../etc/passwd"),
    "same-origin resolution makes that a 404, not an escape"
  );
  check(
    "case is not the guard's business: the real mixed-case path and a lower-cased one both pass",
    isRenderableImageSrc("/brands/COSRX.svg") && isRenderableImageSrc("/brands/cosrx.svg"),
    "so a wrong-cased logoUrl is a filesystem question, not a guard rejection"
  );

  check(
    "non-strings are refused, not coerced",
    !isRenderableImageSrc(undefined) && !isRenderableImageSrc(null) && isRenderableImageSrc("/x"),
    "only a string may reach next/image"
  );
  check(
    "the accepted value is trimmed, so the rendered URL is the checked one",
    firstRenderableImageSrc("  /images/hero.jpg  ") === "/images/hero.jpg",
    String(firstRenderableImageSrc("  /images/hero.jpg  "))
  );
  check(
    "firstRenderableImageSrc skips unusable candidates and takes the first usable one",
    firstRenderableImageSrc(
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
      "",
      undefined,
      "/images/fallback.jpg",
      "/images/never-reached.jpg"
    ) === "/images/fallback.jpg"
  );
  check(
    "firstRenderableImageSrc returns null when nothing is usable",
    firstRenderableImageSrc(null, undefined, "", "https://example.com/x.jpg") === null
  );
  check(
    "the image guard itself is import-free",
    !/^\s*import\b/m.test(readSource(SAFE_IMAGE_SRC_FILE)),
    "one definition, callable anywhere"
  );

  /* ── G. The guard mirrors the allowlist it enforces ────────────────── */
  section("G. The guard mirrors `images.remotePatterns`");

  const nextConfig = readFileSync(NEXT_CONFIG_FILE, "utf8");

  check(
    "the config's hostname is the one the guard pins",
    nextConfig.includes(`hostname: "${IMAGE_REMOTE_HOSTNAME}"`),
    IMAGE_REMOTE_HOSTNAME
  );
  check(
    "the config's pathname is the guard's prefix followed by /**",
    nextConfig.includes(`pathname: "${IMAGE_REMOTE_PATH_PREFIX}/**"`),
    `${IMAGE_REMOTE_PATH_PREFIX}/**`
  );
  check(
    "the config pins the https protocol, which the guard requires",
    /protocol:\s*"https"/.test(nextConfig)
  );
  check(
    "exactly one remote origin is allowlisted",
    (nextConfig.match(/hostname:\s*"/g) ?? []).length === 1,
    "a second host silently widens the optimizer's attack surface (GHSA-2xp9-vwfh-vxw4)"
  );

  /* ── H. Every stored image reaches next/image through the guard ───── */
  section("H. Render sites use the guard");

  const IMAGE_SITES: { label: string; file: string }[] = [
    { label: "ProductImage", file: PRODUCT_IMAGE_FILE },
    { label: "product card", file: PRODUCT_CARD_FILE },
    { label: "PDP", file: PDP_FILE },
    { label: "product gallery", file: PRODUCT_GALLERY_FILE },
    // The homepage banner: slide artwork is pasted by an admin and can name any
    // host, so it is gated exactly like a stored product URL.
    { label: "hero slider", file: HERO_SECTION_FILE },
    // The brand surface: three more places a server-supplied URL reaches an image.
    // They render a plain <img> rather than next/image (vector logos, no stored
    // dimensions), which makes the guard no less necessary — it is what decides
    // whether the value renders at all, and the marquee and the grid both drop a
    // value it refuses rather than showing a broken mark.
    //
    // The mobile drawer is deliberately NOT in this list: `Brands` is a plain
    // destination link now (no accordion, no logos), so it has no stored URL to
    // gate. Section H asserts that directly below, which keeps the surface
    // covered rather than silently untested.
    { label: "brand navbar dropdown", file: BRAND_NAVBAR_FILE },
    { label: "brand card", file: BRAND_CARD_FILE },
    { label: "brand marquee", file: BRAND_MARQUEE_FILE },
  ];

  for (const { label, file } of IMAGE_SITES) {
    const source = readSource(file);

    check(`${label}: imports the shared image guard`, /from "@\/lib\/safe-image-src"/.test(source));
    check(
      `${label}: gates a stored URL with the predicate`,
      // A call, or the value handed to `.filter(...)` — `filter(isRenderableImageSrc)`
      // passes the function itself, so a `\(` test alone would miss it.
      /(?:isRenderableImageSrc|firstRenderableImageSrc)\s*[(),]/.test(source)
    );
    check(
      `${label}: no raw stored image binding reaches <Image>`,
      !STORED_IMAGE_SRC_BINDING.test(source),
      "this is the shape that threw inside the cart drawer"
    );
  }

  // The drawer used to list every brand with its logo. It now renders the shared
  // navigation model only — `Brands` is a link to `/brands` and the Shop rows are
  // text — so there is no stored image to gate and importing the guard would be a
  // dead import. This assertion keeps the surface honest: if artwork is ever put
  // back, it fails and the file must return to IMAGE_SITES above.
  const mobileMenuSource = readSource(BRAND_MOBILE_MENU_FILE);
  check(
    "brand mobile drawer: renders no stored image (Brands is a plain link)",
    !/<img\b/.test(mobileMenuSource) && !STORED_IMAGE_SRC_BINDING.test(mobileMenuSource),
    "if this changes, the drawer belongs back in IMAGE_SITES"
  );

  const productImageSource = readSource(PRODUCT_IMAGE_FILE);
  const productImageSrcs = [...productImageSource.matchAll(/src=\{([^}]+)\}/g)].map((match) =>
    match[1].trim()
  );
  check(
    "ProductImage: every src it renders is the vetted local",
    productImageSrcs.length > 0 && productImageSrcs.every((expression) => expression === "safeSrc"),
    JSON.stringify(productImageSrcs)
  );

  const productCardSource = readSource(PRODUCT_CARD_FILE);
  check(
    "product card: the fallback chain walks the filtered list, not the raw field",
    !/product\.images\?\.indexOf/.test(productCardSource) && /availableImages\.indexOf/.test(productCardSource)
  );

  const pdpSource = readSource(PDP_FILE);
  check(
    "PDP: the related-products thumbnail is its own guarded component",
    /<RelatedThumb product=/.test(pdpSource) && !/src=\{p\.images\[0\]\}/.test(pdpSource)
  );

  /* ── I. Controls ───────────────────────────────────────────────────── */
  section("I. Controls: the pre-fix bindings must fail these rules");

  const PRE_FIX_THUMBNAIL = '<Image src={p.images[0]} alt={p.name} fill className="object-cover" />';
  const PRE_FIX_WRAPPER = 'return <Image src={src} alt={alt} fill />;';

  check(
    "control: the pre-fix PDP thumbnail is caught by the stored-binding rule",
    STORED_IMAGE_SRC_BINDING.test(PRE_FIX_THUMBNAIL),
    "if this passes, rule H is not measuring the binding"
  );
  check(
    "control: the pre-fix ProductImage src is caught by the vetted-local rule",
    ![...PRE_FIX_WRAPPER.matchAll(/src=\{([^}]+)\}/g)].every((match) => match[1].trim() === "safeSrc")
  );
  check(
    "control: the predicate refuses the exact URL from the reported crash",
    !isRenderableImageSrc(REPORTED_CRASH_IMAGE_URL)
  );
  check(
    "control: a foreign ImageKit endpoint is refused, ours accepted",
    !isRenderableImageSrc("https://ik.imagekit.io/someoneelse/product.jpg") &&
      isRenderableImageSrc(`https://${IMAGE_REMOTE_HOSTNAME}${IMAGE_REMOTE_PATH_PREFIX}/product.jpg`),
    "isImageKitUrl() accepts both — it decides a loader, it is not a gate"
  );

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

  console.log("All stored-URL guard checks passed.");
};

void main();
