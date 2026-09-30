/**
 * P1.6.5 — the vendored `bangladesh-geojson` data.
 *
 * Run with: npm run verify:locations-data
 *
 * The four files in `src/data/bangladesh-geojson/` replaced the
 * `"bangladesh-geojson": "github:ifahimreza/bangladesh-geojson"` dependency — a bare
 * `github:` specifier resolved over `git+ssh`, which put it outside the registry audit
 * entirely. Nothing about the data changed, so the risk of moving it is *silent*
 * damage: a truncated copy, a missing file, an import left pointing at the removed
 * package. That is what this file checks.
 *
 * It reads the JSON from disk rather than importing `src/constants/bangladesh-locations.ts`.
 * Two reasons:
 *   1. These harnesses run as raw TypeScript under Node's type stripping, and Node
 *      does not import JSON without an import attribute — which Next would then have
 *      to accept in application code. Keeping the harness out of the app's import
 *      graph avoids forcing that choice on the app.
 *   2. Reading the shipped file is the assertion that matters here. Importing the
 *      module would additionally exercise the transform in `bangladesh-locations.ts`,
 *      which `tsc` and the build already cover.
 *
 * ## What it deliberately does not prove
 *
 * It does not prove the data is *correct* — only that it is the same shape and size
 * as the upstream revision it was copied from. The row counts below (8 / 64) are the
 * stable facts; the upazila and Dhaka-area counts are asserted as non-empty with a
 * floor, because those are the two upstream lists that plausibly grow.
 *
 * Exits non-zero if any check fails.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "src", "data", "bangladesh-geojson");

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
 * Parses a vendored file, recording a failure instead of throwing.
 *
 * A missing or truncated file used to abort the run at the first read, which hid
 * every later check — the harness would report one problem and silently skip the
 * rest. Returning `{}` lets each dependent check fail on its own terms.
 */
const readJson = (name: string): unknown => {
  try {
    return JSON.parse(readFileSync(join(dataDir, name), "utf8")) as unknown;
  } catch (error) {
    check(`${name} is readable and valid JSON`, false, (error as Error).message.slice(0, 120));
    return {};
  }
};

const readText = (path: string): string => readFileSync(path, "utf8");

/** `src/constants/bangladesh-locations.ts` with comment-only lines blanked. */
const blankComments = (source: string): string =>
  source
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*") ? "" : line;
    })
    .join("\n");

/* ── A. The files are present ─────────────────────────────────────────────── */

section("A. Vendored files");

const files = ["bd-divisions.json", "bd-districts.json", "bd-upazilas.json", "dhaka-city.json"];

for (const file of files) {
  check(`${file} exists`, existsSync(join(dataDir, file)));
}

check("LICENSE is carried with the data", existsSync(join(dataDir, "LICENSE")));
check("LICENSE-DATA (ODbL) is carried with the data", existsSync(join(dataDir, "LICENSE-DATA")));
check(
  "the README names the upstream commit the copy came from",
  /4723ee5f9fecaa79af6266a746cf89c39841a02d/.test(readText(join(dataDir, "README.md")))
);
check(
  "the README says the data is ODbL, not MIT",
  /ODbL/.test(readText(join(dataDir, "README.md")))
);
check(
  "LICENSE-DATA really is the ODbL text",
  /Open Database License/.test(readText(join(dataDir, "LICENSE-DATA")))
);

/* ── B. The data parses and has the expected shape ────────────────────────── */

section("B. Data integrity");

const divisions = readJson("bd-divisions.json") as { divisions?: Array<Record<string, unknown>> };
const districts = readJson("bd-districts.json") as { districts?: Array<Record<string, unknown>> };
const upazilas = readJson("bd-upazilas.json") as { upazilas?: Array<Record<string, unknown>> };
const dhakaCity = readJson("dhaka-city.json") as { dhaka?: Array<Record<string, unknown>> };

check("divisions parses to an array", Array.isArray(divisions.divisions), typeof divisions.divisions);
check("districts parses to an array", Array.isArray(districts.districts), typeof districts.districts);
check("upazilas parses to an array", Array.isArray(upazilas.upazilas), typeof upazilas.upazilas);
check("dhaka-city parses to an array under `dhaka`", Array.isArray(dhakaCity.dhaka), typeof dhakaCity.dhaka);

check(
  "there are 8 divisions",
  divisions.divisions?.length === 8,
  `${divisions.divisions?.length} divisions`
);
check(
  "there are 64 districts",
  districts.districts?.length === 64,
  `${districts.districts?.length} districts`
);
check(
  "at least 490 upazilas",
  (upazilas.upazilas?.length ?? 0) >= 490,
  `${upazilas.upazilas?.length} upazilas`
);
check(
  "at least 90 Dhaka city areas",
  (dhakaCity.dhaka?.length ?? 0) >= 90,
  `${dhakaCity.dhaka?.length} areas`
);

check(
  "every division has an id and a name",
  (divisions.divisions ?? []).every(
    (row) => typeof row.id === "string" && typeof row.name === "string" && row.name.length > 0
  )
);
check(
  "every district carries a division_id that exists",
  (() => {
    const ids = new Set((divisions.divisions ?? []).map((row) => row.id));
    const orphans = (districts.districts ?? []).filter((row) => !ids.has(row.division_id));
    console.log(`       (orphan districts: ${orphans.length})`);
    return orphans.length === 0;
  })()
);
check(
  "every upazila carries a district_id that exists",
  (() => {
    const ids = new Set((districts.districts ?? []).map((row) => row.id));
    const orphans = (upazilas.upazilas ?? []).filter((row) => !ids.has(row.district_id));
    console.log(`       (orphan upazilas: ${orphans.length})`);
    return orphans.length === 0;
  })()
);
check(
  "no upazila name is empty",
  (upazilas.upazilas ?? []).every((row) => typeof row.name === "string" && row.name.trim().length > 0)
);

// The counts the app exposes. Asserted against the source so `LOCATION_DATA_COUNTS`
// cannot silently become a different number than the data it summarises.
const countsMatch = /LOCATION_DATA_COUNTS\s*=\s*\{[\s\S]*?divisions:\s*divisions\.length[\s\S]*?districts:\s*districts\.length[\s\S]*?upazilas:\s*upazilas\.length[\s\S]*?\}/.test(
  readText(join(root, "src", "constants", "bangladesh-locations.ts"))
);
check("LOCATION_DATA_COUNTS still derives from the parsed arrays, not literals", countsMatch);

/* ── C. The dependency is gone and nothing still points at it ─────────────── */

section("C. The dependency really was removed");

const packageJson = JSON.parse(readText(join(root, "package.json"))) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

check(
  "package.json no longer declares bangladesh-geojson",
  !("bangladesh-geojson" in (packageJson.dependencies ?? {})) &&
    !("bangladesh-geojson" in (packageJson.devDependencies ?? {}))
);

const lockText = readText(join(root, "package-lock.json"));
check(
  "package-lock.json no longer resolves it",
  !lockText.includes("bangladesh-geojson")
);

const constantsSource = blankComments(readText(join(root, "src", "constants", "bangladesh-locations.ts")));
check(
  "the constants module no longer imports the package",
  !/from\s+["']bangladesh-geojson/.test(constantsSource)
);

for (const file of files) {
  check(
    `the constants module imports ${file} from the vendored directory`,
    constantsSource.includes(`@/data/bangladesh-geojson/${file}`)
  );
}

check(
  "the hand-rolled module declarations were deleted",
  !existsSync(join(root, "src", "types", "bangladesh-geojson.d.ts"))
);

// Cheap integrity canary: the byte size of each file. A truncated copy is the
// realistic failure mode here, and it would still parse as JSON if the cut landed
// between array elements.
const sizes: Record<string, number> = {
  "bd-divisions.json": 1198,
  "bd-districts.json": 11464,
  "bd-upazilas.json": 64090,
  "dhaka-city.json": 32052,
};

for (const file of files) {
  const bytes = readFileSync(join(dataDir, file)).byteLength;
  check(
    `${file} is the expected size (${sizes[file]} bytes)`,
    bytes === sizes[file],
    `${bytes} bytes`
  );
}

const hashes: Record<string, string> = {
  "bd-divisions.json": "2d1abe211bb26c35446631e408dd2c47bc5778d7e7a1f7b36eb6960449eeba25",
  "bd-districts.json": "deb62efbfa585264b7342e97774e76273cf8962d035a7632414aebbd9740dfb6",
  "bd-upazilas.json": "ae7b5360b5ffac5910e4f6a0e0c533bc1825cded31de3f2b9f1122fca474d2b8",
  "dhaka-city.json": "f3322244349262dcdce3685918a9c9776ea83b29386da7755cfc8e28167e1484",
};

for (const file of files) {
  const digest = createHash("sha256").update(readFileSync(join(dataDir, file))).digest("hex");
  check(
    `${file} matches the revision that was copied in`,
    digest === hashes[file],
    digest === hashes[file] ? "" : `sha256 ${digest.slice(0, 16)}… (recorded ${hashes[file].slice(0, 16)}…)`
  );
}

/* ── Result ───────────────────────────────────────────────────────────────── */

console.log(`\n${failures.length === 0 ? "PASS" : "FAIL"} — ${failures.length} failure(s)`);

if (failures.length > 0) {
  process.exitCode = 1;
}
