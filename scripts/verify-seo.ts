/**
 * SEO — the storefront's technical-SEO invariants.
 *
 * Run with: npm run verify:seo
 *
 * ## Why this exists
 *
 * SEO is invisible to every other gate. `tsc` is happy with a page that has no
 * `<title>`; the build is happy with a `robots.txt` that disallows everything;
 * neither notices that a route's metadata silently stopped being emitted because
 * someone added `"use client"` to the page. Each of those is a slow, quiet loss
 * of traffic rather than a crash — which is exactly the class of bug a harness
 * should own.
 *
 * ## What it asserts
 *
 *   A. the technical foundation exists — `src/app/sitemap.ts`, `src/app/robots.ts`,
 *      and the `src/lib/seo/*` modules;
 *   B. `sitemap()` returns valid entries: absolute https URLs, no duplicates,
 *      valid `changeFrequency`, priority in [0,1], a real `lastModified`, and the
 *      rows that must be present (static routes, catalogue, categories, posts);
 *   C. `robots()` has the agreed rules and advertises the sitemap;
 *   D. every JSON-LD generator emits the right `@type`, and `serializeJsonLd`
 *      neutralises `</script>` while staying valid JSON;
 *   E. the generated graph survives being rendered — the `<JsonLd>` component's
 *      approach (a `<script>` text child, NOT `dangerouslySetInnerHTML`) is
 *      verified against the installed `react-dom/server`;
 *   F. each route is actually wired: the segment exporting metadata, the canonical
 *      built by `buildPageMetadata`, and the JSON-LD generator it renders;
 *   G. controls — the presence predicates reject a page with the metadata removed,
 *      and the naive `JSON.stringify` is shown to be unsafe, so the checks above
 *      cannot pass vacuously.
 *
 * ## Determinism
 *
 * `NEXT_PUBLIC_API_URL` is cleared before anything is awaited, so the sitemap and
 * the metadata lookups always take their bundled-constants path. Without this the
 * harness would hit a developer's live API and assert against live data.
 *
 * Node runs this file by stripping types, so it must stay erasable (no enums, no
 * namespaces, no parameter properties) and use explicit `.ts` extensions on
 * relative imports. It is not JSX, so the `<JsonLd>` component is exercised
 * through `React.createElement` rather than by importing the `.tsx` file.
 *
 * Exits non-zero if any check fails.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import robots from "../src/app/robots.ts";
import sitemap from "../src/app/sitemap.ts";
import { BLOG_POSTS } from "../src/constants/blog.ts";
import { FAQS } from "../src/constants/faq.ts";
import { CATEGORIES, SITE_URL } from "../src/constants/site.ts";
import { LOCAL_CATALOG_COMBOS, LOCAL_CATALOG_PRODUCTS } from "../src/lib/seo/data.ts";
import {
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
  generateOrganizationJsonLd,
  generateProductJsonLd,
  generateWebSiteJsonLd,
  serializeJsonLd,
} from "../src/lib/seo/json-ld.ts";
import { buildPageMetadata, DEFAULT_OG_IMAGE } from "../src/lib/seo/metadata.ts";
import { STATIC_ROUTES } from "../src/lib/seo/sitemap.ts";

// Never let a developer's live API leak into these assertions.
delete process.env.NEXT_PUBLIC_API_URL;

const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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

const read = (relativePath: string): string =>
  readFileSync(join(APP_ROOT, relativePath), "utf8");

const exists = (relativePath: string): boolean => existsSync(join(APP_ROOT, relativePath));

/* ── Route segment paths, named once so the report and §F agree ─────────────── */

const ROUTES = {
  sitemap: "src/app/sitemap.ts",
  robots: "src/app/robots.ts",
  rootLayout: "src/app/layout.tsx",
  jsonLdComponent: "src/components/seo/json-ld.tsx",
  jsonLdLib: "src/lib/seo/json-ld.ts",
  metadataLib: "src/lib/seo/metadata.ts",
  dataLib: "src/lib/seo/data.ts",
  sitemapLib: "src/lib/seo/sitemap.ts",
  urlsLib: "src/lib/seo/urls.ts",
  productPage: "src/app/(public)/product/[slug]/page.tsx",
  productLayout: "src/app/(public)/product/[slug]/layout.tsx",
  comboPage: "src/app/(public)/combo/[slug]/page.tsx",
  comboLayout: "src/app/(public)/combo/[slug]/layout.tsx",
  comboIndex: "src/app/(public)/combo/page.tsx",
  shopPage: "src/app/(public)/shop/page.tsx",
  shopLayout: "src/app/(public)/shop/layout.tsx",
  blogPage: "src/app/(public)/blog/[slug]/page.tsx",
  homePage: "src/app/(public)/page.tsx",
  faqPage: "src/app/(public)/faq/page.tsx",
  faqConstants: "src/constants/faq.ts",
  cartLayout: "src/app/(public)/cart/layout.tsx",
  checkoutLayout: "src/app/(public)/checkout/layout.tsx",
  authLayout: "src/app/(auth)/layout.tsx",
  dashboardLayout: "src/app/(dashboard)/layout.tsx",
} as const;

/* ── The presence predicates (§F), defined up here so §G can control them ───── */

const hasGenerateMetadata = (source: string): boolean =>
  /export\s+(async\s+)?function\s+generateMetadata\s*\(/.test(source);

const hasMetadataExport = (source: string): boolean =>
  hasGenerateMetadata(source) || /export\s+const\s+metadata\s*(:|=)/.test(source);

const hasJsonLdElement = (source: string): boolean => /<JsonLd\b/.test(source);

/** Strips every `<JsonLd … />` from a source file, simulating its removal. */
const withoutJsonLd = (source: string): string => source.replace(/<JsonLd[\s\S]*?\/>/g, "");

/**
 * Blanks comments before a source scan.
 *
 * `src/components/seo/json-ld.tsx` explains in prose why it does NOT use
 * `dangerouslySetInnerHTML`; without this, the explanation itself would trip the
 * grep. Same reason `scripts/verify-no-html-sinks.ts` blanks comments first.
 */
const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

/** The text between an element's first `>` and its closing `<`. */
const elementBody = (markup: string): string =>
  markup.slice(markup.indexOf(">") + 1, markup.lastIndexOf("<"));

/* ── A. Technical foundation ──────────────────────────────────────────────── */

section("A. Technical foundation");

for (const [label, path] of [
  ["sitemap route", ROUTES.sitemap],
  ["robots route", ROUTES.robots],
  ["JSON-LD generator module", ROUTES.jsonLdLib],
  ["metadata builder module", ROUTES.metadataLib],
  ["catalogue data module", ROUTES.dataLib],
  ["sitemap entry builder", ROUTES.sitemapLib],
  ["absolute-URL module", ROUTES.urlsLib],
  ["JSON-LD component", ROUTES.jsonLdComponent],
  ["FAQ content module", ROUTES.faqConstants],
  ["cart noindex layout", ROUTES.cartLayout],
  ["checkout noindex layout", ROUTES.checkoutLayout],
  ["auth noindex layout", ROUTES.authLayout],
  ["dashboard noindex layout", ROUTES.dashboardLayout],
] as const) {
  check(`${label} exists (${path})`, exists(path));
}

const sitemapSource = read(ROUTES.sitemap);
const robotsSource = read(ROUTES.robots);
const rootLayoutSource = read(ROUTES.rootLayout);
const jsonLdComponentSource = read(ROUTES.jsonLdComponent);

check(
  "sitemap route exports a default (metadata) function",
  /export\s+default\s+async\s+function\s+sitemap\b/.test(sitemapSource),
);
check(
  "robots route exports a default function",
  /export\s+default\s+function\s+robots\b/.test(robotsSource),
);
check(
  "root layout declares a metadataBase",
  /metadataBase\s*:\s*new\s+URL\(/.test(rootLayoutSource),
);
check(
  "root layout requests index/follow",
  /robots\s*:\s*\{[\s\S]*?index\s*:\s*true[\s\S]*?follow\s*:\s*true/.test(rootLayoutSource),
);
check(
  "root layout declares an Open Graph block with images",
  /openGraph\s*:\s*\{[\s\S]*?images\s*:/.test(rootLayoutSource),
);
check(
  "root layout declares a Twitter card",
  /twitter\s*:\s*\{[\s\S]*?card\s*:\s*"summary_large_image"/.test(rootLayoutSource),
);
check(
  "root layout does NOT set a site-wide canonical (metadata is inherited)",
  !/alternates\s*:\s*\{[\s\S]{0,120}canonical\s*:/.test(rootLayoutSource),
  "a root canonical would point every page that forgets its own at the homepage",
);

/* ── B. sitemap() returns valid entries ───────────────────────────────────── */

section("B. sitemap() entries");

const entries = await sitemap();

check("sitemap() resolves to an array", Array.isArray(entries), typeof entries);
check("sitemap() is not empty", entries.length > 0, `${entries.length} entries`);

const CHANGE_FREQUENCIES = new Set([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

check(
  "every entry has an absolute https URL under the site origin",
  entries.every((entry) => entry.url.startsWith(`${SITE_URL}/`) || entry.url === SITE_URL),
  entries.find((entry) => !entry.url.startsWith(SITE_URL))?.url,
);
check(
  "every entry has a valid changeFrequency",
  entries.every((entry) => CHANGE_FREQUENCIES.has(entry.changeFrequency as string)),
  entries.find((entry) => !CHANGE_FREQUENCIES.has(entry.changeFrequency as string))?.url,
);
check(
  "every entry has a priority within [0, 1]",
  entries.every((entry) => typeof entry.priority === "number" && entry.priority >= 0 && entry.priority <= 1),
);
check(
  "every entry has a real lastModified date",
  entries.every((entry) => entry.lastModified instanceof Date && !Number.isNaN(entry.lastModified.getTime())),
);
check(
  "URLs are unique",
  new Set(entries.map((entry) => entry.url)).size === entries.length,
  `${entries.length - new Set(entries.map((entry) => entry.url)).size} duplicate(s)`,
);

const urls = new Set(entries.map((entry) => entry.url));
const has = (path: string): boolean => urls.has(`${SITE_URL}${path}`);

for (const route of STATIC_ROUTES) {
  check(`static route is listed: ${route.path}`, has(route.path));
}

const productEntries = entries.filter((entry) => entry.url.includes("/product/"));
const comboEntries = entries.filter((entry) => entry.url.includes("/combo/"));
const blogEntries = entries.filter((entry) => entry.url.includes("/blog/"));

check(
  "every bundled product is listed",
  productEntries.length >= LOCAL_CATALOG_PRODUCTS.length,
  `${productEntries.length} listed vs ${LOCAL_CATALOG_PRODUCTS.length} bundled`,
);
check(
  "every bundled combo is listed",
  comboEntries.length >= LOCAL_CATALOG_COMBOS.length,
  `${comboEntries.length} listed vs ${LOCAL_CATALOG_COMBOS.length} bundled`,
);
check(
  "every blog post is listed",
  blogEntries.length >= BLOG_POSTS.length,
  `${blogEntries.length} listed vs ${BLOG_POSTS.length} posts`,
);
check(
  "every category filter is listed",
  CATEGORIES.every((category) => urls.has(`${SITE_URL}/shop?category=${category.slug}`)),
);

check(
  "a product entry carries the product's own createdAt",
  (() => {
    const sample = LOCAL_CATALOG_PRODUCTS.find((product) => !!product.createdAt);
    if (!sample?.createdAt) return false;
    const entry = entries.find((candidate) => candidate.url === `${SITE_URL}/product/${sample.slug}`);
    if (!entry?.lastModified) return false;
    return new Date(entry.lastModified).toISOString().startsWith(sample.createdAt.slice(0, 10));
  })(),
);

/* ── C. robots() rules ────────────────────────────────────────────────────── */

section("C. robots() rules");

const robotsResult = robots();
const rule = Array.isArray(robotsResult.rules) ? robotsResult.rules[0] : robotsResult.rules;

check("there is at least one rule", !!rule);
check("the rule targets every crawler", rule?.userAgent === "*", String(rule?.userAgent));
check("crawling is allowed by default", rule?.allow === "/", String(rule?.allow));

const disallow = Array.isArray(rule?.disallow) ? rule.disallow : [rule?.disallow];
for (const path of ["/api/", "/_next/", "/admin/"]) {
  check(`disallow list contains ${path}`, disallow.includes(path));
}

check(
  "the sitemap is advertised",
  robotsResult.sitemap === `${SITE_URL}/sitemap.xml`,
  String(robotsResult.sitemap),
);

/* ── D. JSON-LD generators ────────────────────────────────────────────────── */

section("D. JSON-LD generators");

const sampleProduct = LOCAL_CATALOG_PRODUCTS[0];
const productNode = generateProductJsonLd(sampleProduct);

check("Product node declares the schema.org context", productNode["@context"] === "https://schema.org");
check("Product node has @type Product", productNode["@type"] === "Product");
check("Product node carries the product name", productNode.name === sampleProduct.name);
check(
  "Product node carries an absolute URL",
  typeof productNode.url === "string" && String(productNode.url).startsWith(`${SITE_URL}/product/`),
  String(productNode.url),
);

const offer = productNode.offers as Record<string, unknown> | undefined;
check("Product node has an Offer", !!offer && offer["@type"] === "Offer");
check("the Offer is priced in BDT", offer?.priceCurrency === "BDT");
check("the Offer price is a decimal string", /^\d+\.\d{2}$/.test(String(offer?.price)), String(offer?.price));
check(
  "the Offer availability is a schema.org value",
  typeof offer?.availability === "string" && String(offer?.availability).startsWith("https://schema.org/"),
  String(offer?.availability),
);

const brand = productNode.brand as Record<string, unknown> | undefined;
check("Product node has a Brand", brand?.["@type"] === "Brand" && brand?.name === sampleProduct.brand);

check(
  "a product with no reviews emits no aggregateRating (invalid markup otherwise)",
  !("aggregateRating" in productNode),
);

const ratedProduct = generateProductJsonLd({ ...sampleProduct, rating: 4.5, reviewCount: 12 });
const rating = ratedProduct.aggregateRating as Record<string, unknown> | undefined;
check("a reviewed product emits an AggregateRating", rating?.["@type"] === "AggregateRating");
check("the AggregateRating carries both numbers", rating?.ratingValue === "4.5" && rating?.reviewCount === "12");

const comboNode = generateProductJsonLd(sampleProduct, { path: `/combo/${sampleProduct.slug}` });
check(
  "the combo path override reaches the Offer URL",
  String((comboNode.offers as Record<string, unknown>).url).endsWith(`/combo/${sampleProduct.slug}`),
);

const breadcrumb = generateBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
]);
const crumbs = breadcrumb.itemListElement as Array<Record<string, unknown>>;
check("BreadcrumbList has @type BreadcrumbList", breadcrumb["@type"] === "BreadcrumbList");
check("breadcrumbs are 1-based and ordered", crumbs[0]?.position === 1 && crumbs[1]?.position === 2);
check(
  "breadcrumb items are absolute URLs",
  crumbs.every((crumb) => String(crumb.item).startsWith(`${SITE_URL}/`)),
);

const organization = generateOrganizationJsonLd();
check("Organization has @type Organization", organization["@type"] === "Organization");
check("Organization carries the site name and URL", organization.name === "Mioralane" && organization.url === SITE_URL);
check(
  "Organization lists social profiles in sameAs",
  Array.isArray(organization.sameAs) && organization.sameAs.length > 0,
);
check(
  "Organization does NOT list WhatsApp as a profile",
  Array.isArray(organization.sameAs) && !organization.sameAs.some((href) => String(href).includes("wa.me")),
);

const website = generateWebSiteJsonLd();
check("WebSite has @type WebSite", website["@type"] === "WebSite");
check(
  "WebSite declares a SearchAction into /shop?search=",
  String((website.potentialAction as Record<string, unknown>)["@type"]) === "SearchAction" &&
    String(((website.potentialAction as Record<string, unknown>).target as Record<string, unknown>).urlTemplate).includes(
      "/shop?search=",
    ),
);

const faqNode = generateFaqJsonLd(FAQS);
const questions = faqNode.mainEntity as Array<Record<string, unknown>>;
check("FAQPage has @type FAQPage", faqNode["@type"] === "FAQPage");
check("FAQPage marks up every FAQ", questions.length === FAQS.length, `${questions.length} vs ${FAQS.length}`);
check(
  "every question has a text answer",
  questions.every(
    (question) =>
      question["@type"] === "Question" &&
      typeof question.name === "string" &&
      (question.acceptedAnswer as Record<string, unknown>)?.["@type"] === "Answer" &&
      typeof (question.acceptedAnswer as Record<string, unknown>)?.text === "string",
  ),
);

/* ── D2. serialization safety ─────────────────────────────────────────────── */

section("D2. serializeJsonLd");

const hostile = { name: 'A "</script><img src=x onerror=alert(1)>" B', note: "a & b" };
const serialized = serializeJsonLd(hostile);

check("no raw `<` survives serialization", !serialized.includes("<"), serialized.slice(0, 80));
check("the payload still round-trips through JSON.parse", (() => {
  try {
    return JSON.parse(serialized).name === hostile.name && JSON.parse(serialized).note === hostile.note;
  } catch {
    return false;
  }
})());
check("the closing-tag sequence is unrepresentable", !serialized.includes("</script"));
check("`&` is left alone (it needs no escaping inside a script body)", serialized.includes("a & b"));

/* ── E. The `<JsonLd>` renderer ───────────────────────────────────────────── */

section("E. <JsonLd> rendering");

const jsonLdComponentCode = stripComments(jsonLdComponentSource);

check(
  "the component renders a script element of type application/ld+json",
  /type="application\/ld\+json"/.test(jsonLdComponentCode),
);
check(
  "the component routes every payload through serializeJsonLd",
  /serializeJsonLd\(/.test(jsonLdComponentCode),
);
check(
  "the component does NOT use dangerouslySetInnerHTML",
  !/dangerouslySetInnerHTML/.test(jsonLdComponentCode),
);

const renderScript = (body: string): string =>
  renderToStaticMarkup(createElement("script", { type: "application/ld+json" }, body));

const renderedScript = renderScript(serializeJsonLd(hostile));
const expectedScript = `<script type="application/ld+json">${serializeJsonLd(hostile)}</script>`;

check(
  "React renders the script body verbatim (the assumption behind omitting dangerouslySetInnerHTML)",
  renderedScript === expectedScript,
  renderedScript.slice(0, 120),
);
check(
  "no HTML entity is introduced inside the script body",
  !renderedScript.includes("&lt;") && !renderedScript.includes("&amp;"),
);
check(
  "the rendered element cannot break out of the script",
  !elementBody(renderedScript).includes("<"),
  elementBody(renderedScript).slice(0, 80),
);

/* ── F. Route wiring ──────────────────────────────────────────────────────── */

section("F. Route wiring");

const productPageSource = read(ROUTES.productPage);
const productLayoutSource = read(ROUTES.productLayout);
const comboPageSource = read(ROUTES.comboPage);
const comboLayoutSource = read(ROUTES.comboLayout);
const shopLayoutSource = read(ROUTES.shopLayout);
const blogPageSource = read(ROUTES.blogPage);
const homePageSource = read(ROUTES.homePage);
const faqPageSource = read(ROUTES.faqPage);

// The dynamic detail pages are client components, so their metadata must live in
// the route-segment layout. Asserting the reason keeps the next person from
// "simplifying" it back into the page.
check(
  "product/[slug] page is a client component (why the layout carries the metadata)",
  /^\s*"use client";/.test(productPageSource),
);
check(
  "product/[slug] segment exports generateMetadata",
  hasMetadataExport(productLayoutSource) && hasGenerateMetadata(productLayoutSource),
);
check(
  "product/[slug] segment renders Product JSON-LD",
  hasJsonLdElement(productLayoutSource) && /generateProductJsonLd\(/.test(productLayoutSource),
);
check(
  "product/[slug] segment renders a BreadcrumbList",
  /generateBreadcrumbJsonLd\(/.test(productLayoutSource),
);
check(
  "product/[slug] layout renders the graph at request time (force-dynamic)",
  /export\s+const\s+dynamic\s*=\s*"force-dynamic"/.test(productLayoutSource),
);
check(
  "combo/[slug] page is a client component (why the layout carries the metadata)",
  /^\s*"use client";/.test(comboPageSource),
);
check(
  "combo/[slug] segment exports generateMetadata",
  hasGenerateMetadata(comboLayoutSource),
);
check(
  "combo/[slug] segment renders Product JSON-LD with the combo path",
  /generateProductJsonLd\(combo,\s*\{\s*path:/.test(comboLayoutSource),
);
check(
  "combo/[slug] segment renders a BreadcrumbList",
  /generateBreadcrumbJsonLd\(/.test(comboLayoutSource),
);
check(
  "shop segment exports metadata",
  hasMetadataExport(shopLayoutSource),
);
check(
  "shop segment renders a BreadcrumbList",
  hasJsonLdElement(shopLayoutSource) && /generateBreadcrumbJsonLd\(/.test(shopLayoutSource),
);
check(
  "blog/[slug] page exports generateMetadata",
  hasGenerateMetadata(blogPageSource),
);
check(
  "blog/[slug] page renders a BreadcrumbList",
  hasJsonLdElement(blogPageSource) && /generateBreadcrumbJsonLd\(/.test(blogPageSource),
);
check(
  "homepage renders Organization + WebSite JSON-LD",
  /generateOrganizationJsonLd\(/.test(homePageSource) && /generateWebSiteJsonLd\(/.test(homePageSource),
);
check(
  "FAQ page renders FAQPage JSON-LD from the shared list",
  /generateFaqJsonLd\(FAQS\)/.test(faqPageSource),
);
check(
  "FAQ page and the accordion read the same array",
  /from "@\/constants\/faq"/.test(faqPageSource) && /<FaqAccordion items=\{FAQS\}/.test(faqPageSource),
);

// Transactional / private routes must not be indexed. They are prerendered, so
// without this they inherit the root layout's `index, follow`.
const NOINDEX_SEGMENTS: Array<[string, string]> = [
  ["cart", ROUTES.cartLayout],
  ["checkout", ROUTES.checkoutLayout],
  ["auth group (login/register)", ROUTES.authLayout],
  ["account area", ROUTES.dashboardLayout],
];

for (const [label, path] of NOINDEX_SEGMENTS) {
  check(
    `${label} opts out of the index`,
    /robots\s*:\s*\{[^}]*index\s*:\s*false/.test(read(path)),
  );
}

const comboIndexSource = read(ROUTES.comboIndex);check("combo index builds metadata through buildPageMetadata", /buildPageMetadata\(/.test(comboIndexSource));check(
  "combo index renders a BreadcrumbList",
  hasJsonLdElement(comboIndexSource) && /generateBreadcrumbJsonLd\(/.test(comboIndexSource),
);
check(
  "combo index does not repeat the brand in its own title (the root template adds it)",
  !/title:\s*"[^"]*Mioralane/.test(comboIndexSource),
);

// Canonical tags: `buildPageMetadata` is the only thing that may set them, so
// each route must go through it rather than hand-rolling metadata.
for (const [label, source] of [
  ["product/[slug] layout", productLayoutSource],
  ["combo/[slug] layout", comboLayoutSource],
  ["shop layout", shopLayoutSource],
  ["blog/[slug] page", blogPageSource],
  ["homepage", homePageSource],
  ["FAQ page", faqPageSource],
] as const) {
  check(`${label} builds metadata through buildPageMetadata`, /buildPageMetadata\(/.test(source));
}

/* ── F2. buildPageMetadata output ─────────────────────────────────────────── */

section("F2. buildPageMetadata output");

const pageMeta = buildPageMetadata({
  title: "Test title",
  description: "Test description",
  path: "/product/example",
});

check("metadata sets a canonical path", pageMeta.alternates?.canonical === "/product/example", String(pageMeta.alternates?.canonical));
check(
  "the Open Graph URL is absolute",
  pageMeta.openGraph?.url === `${SITE_URL}/product/example`,
  String(pageMeta.openGraph?.url),
);
// Next's `Twitter` union has a member without `card`, so the shape is read
// structurally rather than narrowed.
const twitter = pageMeta.twitter as { card?: string } | null | undefined;
check("metadata declares a summary_large_image Twitter card", twitter?.card === "summary_large_image");
check("metadata always carries at least one social image", (pageMeta.openGraph?.images as unknown[])?.length === 1);
check(
  "with no page image the default card is used",
  (pageMeta.openGraph?.images as Array<{ url: string }>)[0].url === DEFAULT_OG_IMAGE.url,
);
check("metadata does not set robots by default (inherits the root index/follow)", pageMeta.robots === undefined);

const imageMeta = buildPageMetadata({
  title: "Test title",
  description: "Test description",
  path: "/product/example",
  images: ["/images/example.jpg"],
});
check(
  "a page image is made absolute for Open Graph",
  (imageMeta.openGraph?.images as Array<{ url: string }>)[0].url === `${SITE_URL}/images/example.jpg`,
  (imageMeta.openGraph?.images as Array<{ url: string }>)[0]?.url,
);

const noIndexMeta = buildPageMetadata({
  title: "Not found",
  description: "Not found",
  path: "/product/missing",
  noIndex: true,
});
check(
  "noIndex asks crawlers not to index but to follow",
  !!noIndexMeta.robots &&
    typeof noIndexMeta.robots === "object" &&
    noIndexMeta.robots.index === false &&
    noIndexMeta.robots.follow === true,
);

const absoluteTitleMeta = buildPageMetadata({
  title: "Mioralane — Premium Korean Skincare",
  description: "…",
  path: "/",
  absoluteTitle: true,
});
const absoluteTitle = absoluteTitleMeta.title as { absolute?: string } | null | undefined;
check(
  "absoluteTitle bypasses the root title template",
  absoluteTitle?.absolute === "Mioralane — Premium Korean Skincare",
);

/* ── G. Controls ──────────────────────────────────────────────────────────── */

section("G. Controls");

check(
  "control: the metadata predicate rejects an empty source",
  hasMetadataExport("") === false,
);
check(
  "control: the metadata predicate rejects a page with the export removed",
  hasMetadataExport(productLayoutSource.replace(/export\s+async\s+function\s+generateMetadata[\s\S]*?\n\}/, "")) === false,
);
check(
  "control: the metadata predicate accepts a hand-written export",
  hasMetadataExport('export const metadata: Metadata = { title: "x" };') === true,
);
check(
  "control: removing every <JsonLd> element makes the presence check fail",
  hasJsonLdElement(withoutJsonLd(productLayoutSource)) === false,
);
check(
  "control: the real product layout does contain <JsonLd> elements",
  hasJsonLdElement(productLayoutSource) === true,
);
check(
  "control: naive JSON.stringify leaves a raw `<` (the escape is load-bearing)",
  JSON.stringify(hostile).includes("<") === true,
);
check(
  "control: the script-breakout check would catch an unescaped payload",
  elementBody(renderScript(JSON.stringify(hostile))).includes("<") === true,
);
check(
  "control: the real sitemap has more entries than the static routes alone",
  entries.length > STATIC_ROUTES.length,
  `${entries.length} vs ${STATIC_ROUTES.length}`,
);
check(
  "control: the noindex predicate rejects a segment that indexes",
  /robots\s*:\s*\{[^}]*index\s*:\s*false/.test("export const metadata: Metadata = { robots: { index: true } };") === false,
);

/* ── Result ───────────────────────────────────────────────────────────────── */

console.log(`\nsitemap: ${entries.length} entries (${productEntries.length} products, ${comboEntries.length} combos, ${blogEntries.length} posts)`);
console.log(`${failures.length === 0 ? "PASS" : "FAIL"} — ${failures.length} failure(s)`);

if (failures.length > 0) {
  process.exitCode = 1;
}
