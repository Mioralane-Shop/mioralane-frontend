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

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "src");
const SAFE_HREF_FILE = join(SRC, "lib", "safe-href.ts");
const CAMPAIGN_FILE = join(SRC, "components", "common", "promotion-campaign.tsx");
const ANNOUNCEMENT_FILE = join(SRC, "components", "layout", "announcement-bar.tsx");
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
