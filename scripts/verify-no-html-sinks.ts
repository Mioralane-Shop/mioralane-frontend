/**
 * P1.4 Block D — the XSS-sink CI invariant (storefront).
 *
 * Run with: npm run verify:no-html-sinks
 *
 * Blocks A–C made *stored* URLs safe and shipped a Report-Only CSP. Both are
 * controls around the same assumption: that React escapes everything this app
 * renders. That assumption survives only while no one writes a string into an
 * HTML sink, and a CSP in Report-Only mode does not stop one either — it would
 * only tell us about it afterwards.
 *
 * So this harness makes the assumption an invariant:
 *
 *   A. no HTML sink exists anywhere in `src/` — the whole grep set the security
 *      review agreed on (`dangerouslySetInnerHTML`, `innerHTML`,
 *      `insertAdjacentHTML`, `document.write`, `outerHTML`, `srcdoc`/`srcDoc`,
 *      `eval(`, `new Function(`, and the string forms of `setTimeout`/
 *      `setInterval`), asserted one pattern at a time so a failure names both the
 *      pattern and the file:line,
 *   B. no `href={…}` expression reads a URL-carrying value. A stored URL reaching
 *      an anchor is Block B's threat; `safeHref()` is the only way one may become
 *      an href, and the result must be a local that does not itself look like a
 *      raw URL (the repo convention is `ctaHref` / `href`),
 *   C. both rules are live: they are run against a fixture that contains every
 *      sink and a raw stored-URL binding, which they must reject, and against a
 *      guarded local, which they must accept.
 *
 * Comments are blanked out (not deleted) before scanning, so line numbers stay
 * true to the file on disk — and so the temporarily-disabled review-image block,
 * which lives inside a `{/* … *\/}` comment, is not reported as live code. If
 * that block is ever restored, this harness starts failing on its
 * `href={image.url}` binding, which is the intended signal to guard it.
 *
 * Node runs this file as TypeScript by stripping types, so it must stay erasable
 * (no enums, no namespaces, no parameter properties) and import with explicit
 * `.ts` extensions where relative.
 *
 * Exits non-zero if any check fails.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(HERE, "..");
const SRC = join(APP_ROOT, "src");
const README_FILE = join(APP_ROOT, "README.md");

/** The other app's copy of this harness, compared in §F when it is checked out. */
const ADMIN_HARNESS_FILE = join(
  APP_ROOT,
  "..",
  "mioralane-admin",
  "scripts",
  "verify-no-html-sinks.ts"
);

interface SinkPattern {
  pattern: RegExp;
  label: string;
}

/**
 * The agreed grep set. One entry per construct that turns a string into markup
 * or code, plus React's camelCase spelling of the `srcdoc` attribute (the
 * lowercase one alone would miss `<iframe srcDoc={…}>`).
 *
 * The list is duplicated in `mioralane-admin/scripts/verify-no-html-sinks.ts` on
 * purpose — the two repositories share no code — and §F fails if they drift.
 */
const HTML_SINKS: SinkPattern[] = [
  { pattern: /\bdangerouslySetInnerHTML\b/, label: "dangerouslySetInnerHTML" },
  { pattern: /\binnerHTML\b/, label: "innerHTML" },
  { pattern: /\bouterHTML\b/, label: "outerHTML" },
  { pattern: /\binsertAdjacentHTML\b/, label: "insertAdjacentHTML" },
  { pattern: /\bdocument\s*\.\s*write(ln)?\s*\(/, label: "document.write" },
  { pattern: /\bsrcDoc\b/, label: "srcDoc" },
  { pattern: /\bsrcdoc\b/, label: "srcdoc" },
  { pattern: /\beval\s*\(/, label: "eval(" },
  { pattern: /\bnew\s+Function\s*\(/, label: "new Function(" },
  { pattern: /\bsetTimeout\s*\(\s*["'`]/, label: "setTimeout with a string body" },
  { pattern: /\bsetInterval\s*\(\s*["'`]/, label: "setInterval with a string body" },
];

/**
 * An `href={…}` expression that reads a URL-carrying value.
 *
 * Deliberately the loose substring test (not a `*Url` property-dereference
 * test): `href={url}` from a prop is exactly the pre-Block-B shape, and it would
 * slip past a `[.]url` pattern. The cost is that a `safeHref()` result must not
 * be *named* `…Url` — name it `ctaHref` / `href`, which is the convention every
 * existing site already follows.
 */
const STORED_URL_HREF = /\bhref=\{([^}]*)\}/g;

const urlCarryingHref = /[Uu]rl/;

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

/** Replaces every non-newline character with a space, keeping the line count. */
const blankOut = (text: string): string => text.replace(/[^\n]/g, " ");

/**
 * Blanks comments instead of removing them, so a line number computed from the
 * result is the line number in the file on disk.
 *
 * Two passes: JSX block comments (`{/* … *\/}`) first, because the lines inside
 * one are not prefixed by anything the line-based pass would recognise; then
 * comment-ONLY lines. A trailing `// …` comment at the end of a code line is not
 * blanked — none of the patterns above appear in prose.
 */
const blankComments = (source: string): string => {
  const withoutJsxBlocks = source.replace(/\{\/\*[\s\S]*?\*\/\}/g, (match) => blankOut(match));

  return withoutJsxBlocks
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();

      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("*/")
      ) {
        return "";
      }

      return line;
    })
    .join("\n");
};

/** Every `.ts` / `.tsx` file under `root`, recursively. */
const collectFiles = (root: string): string[] => {
  const found: string[] = [];
  const entries = readdirSync(root);

  for (const entry of entries) {
    const path = join(root, entry);

    if (statSync(path).isDirectory()) {
      found.push(...collectFiles(path));
      continue;
    }

    if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      found.push(path);
    }
  }

  return found;
};

interface SinkHit {
  file: string;
  line: number;
  label: string;
  text: string;
}

/**
 * Every sink occurrence in already-blanked source, with the line it is on.
 *
 * `blanked` is passed in rather than computed here because §A runs eleven
 * patterns over the same file, and blanking is the expensive half.
 */
const findSinks = (blanked: string, label: string): SinkHit[] => {
  const lines = blanked.split("\n");
  const pattern = HTML_SINKS.find((sink) => sink.label === label)?.pattern;
  const hits: SinkHit[] = [];

  if (!pattern) return hits;

  for (let index = 0; index < lines.length; index += 1) {
    if (pattern.test(lines[index])) {
      hits.push({ file: "", line: index + 1, label, text: lines[index].trim() });
    }
  }

  return hits;
};

/**
 * Every `href={…}` in already-blanked source whose expression mentions `url`.
 *
 * The pattern is re-created per call so a shared instance cannot carry
 * `lastIndex` state between files (the trap `OBJECT_ID_PATTERN` documents).
 */
const urlCarryingHrefs = (blanked: string): { line: number; expression: string }[] => {
  const pattern = new RegExp(STORED_URL_HREF.source, "g");
  const found: { line: number; expression: string }[] = [];
  let match = pattern.exec(blanked);

  while (match !== null) {
    const expression = match[1].trim();

    if (urlCarryingHref.test(expression)) {
      found.push({
        line: blanked.slice(0, match.index).split("\n").length,
        expression,
      });
    }

    match = pattern.exec(blanked);
  }

  return found;
};

/** A source file plus the two facts the rules need about it. */
interface ScannedFile {
  path: string;
  label: string;
  source: string;
  blanked: string;
}

const main = (): void => {
  /* ── A. No HTML sink is reachable ──────────────────────────────────── */
  section("A. No HTML sink exists in src/");

  check("the scan target exists", existsSync(SRC));

  const files: ScannedFile[] = collectFiles(SRC).map((path) => {
    const source = readFileSync(path, "utf8");

    return {
      path,
      label: relative(APP_ROOT, path),
      source,
      blanked: blankComments(source),
    };
  });

  check("the scan reads a non-trivial tree", files.length > 20, `read ${files.length} files`);

  const allHits: SinkHit[] = [];

  for (const { label } of HTML_SINKS) {
    const hits: SinkHit[] = [];

    for (const file of files) {
      for (const hit of findSinks(file.blanked, label)) {
        hits.push({ ...hit, file: file.label });
      }
    }

    allHits.push(...hits);

    check(
      `no ${label}`,
      hits.length === 0,
      hits.map((hit) => `${hit.file}:${hit.line} ${hit.text}`).join(" | ")
    );
  }

  check(
    "the whole sink set was checked, not a subset",
    HTML_SINKS.length >= 11,
    `checked ${HTML_SINKS.length} patterns`
  );

  /* ── B. No stored URL reaches an href ──────────────────────────────── */
  section("B. Every href is a literal, a route, or a safeHref() result");

  const hrefViolations: { file: string; line: number; expression: string }[] = [];

  for (const file of files) {
    for (const violation of urlCarryingHrefs(file.blanked)) {
      hrefViolations.push({ file: file.label, ...violation });
    }
  }

  check(
    "no href expression reads a URL-carrying value",
    hrefViolations.length === 0,
    hrefViolations
      .map((violation) => `${violation.file}:${violation.line} href={${violation.expression}}`)
      .join(" | ")
  );

  // The allow path has to be exercised by the real tree, or rule B could be
  // "satisfied" by deleting the two guarded sites along with their hrefs.
  const guardedSites = files.filter((file) => /from "@\/lib\/safe-href"/.test(file.source));

  check(
    "at least one file still imports the safeHref guard",
    guardedSites.length > 0,
    `found ${guardedSites.length}`
  );
  check(
    "and each of those files binds a local from it",
    guardedSites.length > 0 &&
      guardedSites.every((file) => /const \w+ = safeHref\(/.test(file.source)),
    guardedSites.map((file) => file.label).join(", ")
  );

  /* ── C. Controls: the rules reject, and accept, what they must ─────── */
  section("C. Controls: the rules are live");

  const sinkFixture = [
    "<div dangerouslySetInnerHTML={{ __html: html }} />",
    "element.innerHTML = userText;",
    "element.outerHTML = userText;",
    "element.insertAdjacentHTML('beforeend', userText);",
    "document.write(userText);",
    "<iframe srcDoc={userText} />",
    '<iframe srcdoc="<p>already-html</p>" />',
    "const value = eval(userText);",
    "const fn = new Function(userText);",
    "setTimeout('run()', 10);",
    "setInterval(\"run()\", 10);",
  ].join("\n");

  for (const { label } of HTML_SINKS) {
    const hits = findSinks(blankComments(sinkFixture), label);

    check(
      `control: the ${label} pattern matches a real occurrence`,
      hits.length > 0,
      "if this fails the pattern is inert and section A proves nothing"
    );
  }

  const rawHrefFixture = [
    "<Link href={activeCampaign.popup.ctaUrl}>Shop</Link>",
    "function MessageText({ text, url }) {",
    "  return <Link href={url}>{text}</Link>;",
    "}",
  ].join("\n");

  check(
    "control: a raw stored-URL href is caught",
    urlCarryingHrefs(blankComments(rawHrefFixture)).length === 2,
    `found ${urlCarryingHrefs(blankComments(rawHrefFixture)).length}`
  );
  check(
    "control: and the bare-prop form (href={url}) is caught too",
    urlCarryingHrefs(blankComments("return <Link href={url}>{text}</Link>;")).length === 1,
    "a `*Url` dereference pattern would have missed this one"
  );
  check(
    "control: a vetted local is NOT caught",
    urlCarryingHrefs(
      blankComments("const ctaHref = safeHref(campaign.popup.ctaUrl);\n<Link href={ctaHref}>Shop</Link>")
    ).length === 0
  );
  check(
    "control: an ordinary route href is NOT caught",
    urlCarryingHrefs(blankComments('<Link href={`/product/${p.slug}`} />\n<Link href="/shop" />')).length === 0
  );
  check(
    "control: a sink inside a JSX block comment is not reported as live code",
    findSinks(
      blankComments("{/*\n<div dangerouslySetInnerHTML={{ __html: x }} />\n*/}"),
      "dangerouslySetInnerHTML"
    ).length === 0,
    "this is what keeps the disabled review-image block inert"
  );
  check(
    "control: but the same sink on a live line IS reported",
    findSinks(
      blankComments("<div dangerouslySetInnerHTML={{ __html: x }} />"),
      "dangerouslySetInnerHTML"
    ).length === 1
  );

  if (allHits.length > 0) {
    console.log(`\n  ${allHits.length} sink occurrence(s) found — see the FAIL lines above.`);
  }

  /* ── D. The README states the policy ───────────────────────────────── */
  section("D. The README says what to do instead");

  const readmeRaw = readFileSync(README_FILE, "utf8");
  // Prose is matched with whitespace collapsed: a README edit that reflows a
  // sentence must not fail this check, only one that drops the rule.
  const readme = readmeRaw.replace(/\s+/g, " ");

  check(
    "the README has a section on rendering user content",
    /^##\s+Security: rendering user content\s*$/m.test(readmeRaw)
  );
  check(
    "it states the rule in the agreed words",
    readme.includes("you're about to add an XSS sink that CI will reject")
  );
  check(
    "it names the command that enforces the rule",
    readme.includes("npm run verify:no-html-sinks")
  );
  check(
    "it points at React's text rendering as the alternative",
    /React's text rendering/.test(readme)
  );

  /* ── E. Cross-repo parity ──────────────────────────────────────────── */
  section("E. Cross-repo: the two apps enforce one sink list");

  if (!existsSync(ADMIN_HARNESS_FILE)) {
    console.log(
      "  SKIP mioralane-admin is not checked out beside this repository, so the two\n" +
        "       sink lists could not be compared. Everything above is the CI-enforced half."
    );
  } else {
    const adminSource = readFileSync(ADMIN_HARNESS_FILE, "utf8");
    const entry = /\{\s*pattern:\s*(\/.+?\/),\s*label:\s*"([^"]+)"\s*\}/g;

    const entriesOf = (source: string): string[] => {
      const pattern = new RegExp(entry.source, "g");
      const found: string[] = [];
      let match = pattern.exec(source);

      while (match !== null) {
        found.push(`${match[1]} => ${match[2]}`);
        match = pattern.exec(source);
      }

      return found;
    };

    const mine = entriesOf(readFileSync(fileURLToPath(import.meta.url), "utf8"));
    const theirs = entriesOf(adminSource);

    check(
      "both apps declare the same number of sink patterns",
      mine.length === theirs.length && mine.length === HTML_SINKS.length,
      `frontend ${mine.length}, admin ${theirs.length}, list ${HTML_SINKS.length}`
    );
    check("both apps declare the same patterns, in the same order", mine.join("|") === theirs.join("|"));
    check(
      "both apps apply the same URL-carrying href rule",
      /const urlCarryingHref = (\/.*\/);/.exec(readFileSync(fileURLToPath(import.meta.url), "utf8"))?.[1] ===
        /const urlCarryingHref = (\/.*\/);/.exec(adminSource)?.[1],
      "the two rules must not drift apart"
    );
    check(
      "each app scans its own source tree, not a shared directory",
      /const SRC = join\(APP_ROOT, "src"\)/.test(readFileSync(fileURLToPath(import.meta.url), "utf8")) &&
        /const SCAN_ROOTS: string\[\] = \[/.test(adminSource)
    );
    check(
      "both apps blank comments before scanning, so disabled blocks stay inert",
      /const blankComments = \(source: string\): string => \{/.test(adminSource) &&
        /const blankComments = \(source: string\): string => \{/.test(
          readFileSync(fileURLToPath(import.meta.url), "utf8")
        ) &&
        /blanked: blankComments\(source\)/.test(adminSource) &&
        /blanked: blankComments\(source\)/.test(readFileSync(fileURLToPath(import.meta.url), "utf8")),
      "the two disabled review-image blocks are the reason"
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

  console.log("No HTML sinks, and no stored URL reaches an href.");
};

void main();
