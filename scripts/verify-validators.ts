/**
 * P1.8c — the two Zod validators, `addressSchema` and `checkoutSchema`.
 *
 * Run with: npm run verify:validators
 *
 * ## Why this exists
 *
 * These two schemas are the only zod consumers in the storefront, and they sit on
 * the payment (`/checkout`) and shipping (`address-form`, saved addresses) paths.
 * They previously had no permanent coverage at all: the P1.8c Zod 3 → 4 bump was
 * verified with a throwaway probe that was then deleted, so nothing in CI would
 * notice a schema silently loosening, tightening, or losing its custom messages.
 *
 * `tsc` cannot cover this. A schema whose rule was deleted still type-checks — the
 * types describe the shape, not the constraints — and the custom messages are plain
 * strings that no type knows about. So the assertions here are deliberately about
 * *behaviour*: what parses, what is rejected, and with exactly which message.
 *
 * ## What it deliberately does not prove
 *
 * It does not prove the schemas match the backend's rules, only that they behave as
 * written at this revision. The message strings are asserted by exact equality, so
 * changing a message is a deliberate act that requires editing this file too.
 *
 * Exits non-zero if any check fails.
 */
import { z } from "zod";

import { addressSchema, EMPTY_ADDRESS_FORM } from "../src/lib/validators/address.ts";
import { checkoutSchema } from "../src/lib/validators/checkout.ts";

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

type Issue = { message: string; path: (string | number)[] };

/**
 * Pulls `error.issues` out of a `safeParse` result.
 *
 * Zod 4 replaced `ZodError.errors` with `.issues`, so reading the result through a
 * loose structural shape keeps this harness from depending on a type that moved
 * between majors — which is precisely the kind of change it exists to catch.
 */
const issuesOf = (result: unknown): Issue[] => {
  const shape = result as { success?: boolean; error?: { issues?: Issue[] } };
  return shape.success === false && Array.isArray(shape.error?.issues) ? shape.error.issues : [];
};

const messagesOf = (result: unknown): string[] => issuesOf(result).map((issue) => issue.message);

/** First message attached to a given field path, or "" when that field passes. */
const messageFor = (result: unknown, field: string): string => {
  const issue = issuesOf(result).find((candidate) => candidate.path.join(".") === field);
  return issue ? issue.message : "";
};

/* The exact strings the validators promise. Asserting on these is the point: a
   regenerated or defaulted message is a user-visible regression on a payment form. */
const MSG = {
  name: "Recipient name must be at least 2 characters",
  phoneShort: "Phone number must be at least 10 digits",
  phoneChars: "Phone number contains invalid characters",
  division: "Division is required",
  district: "District is required",
  area: "Area / Thana must be at least 2 characters",
  fullAddress: "Full address must be at least 5 characters",
  address: "Detailed address must be at least 5 characters",
} as const;

const validAddress = {
  name: "Ayesha Rahman",
  phone: "01712345678",
  division: "Dhaka",
  district: "Dhaka",
  area: "Gulshan",
  fullAddress: "House 12, Road 5, Gulshan 1",
  landmark: "Beside the school gate",
  isDefault: true,
};

const validCheckout = {
  name: "Ayesha Rahman",
  phone: "01712345678",
  division: "Dhaka",
  district: "Dhaka",
  area: "Gulshan",
  address: "House 12, Road 5, Gulshan 1",
  landmark: "",
};

/* ── A. addressSchema accepts what it should ──────────────────────────────── */

section("A. addressSchema accepts valid input");

const fullAddress = addressSchema.safeParse(validAddress);
check("a fully populated address parses", fullAddress.success, messagesOf(fullAddress).join(" | "));
check(
  "every provided value survives parsing",
  fullAddress.success &&
    fullAddress.data.name === validAddress.name &&
    fullAddress.data.phone === validAddress.phone &&
    fullAddress.data.division === validAddress.division &&
    fullAddress.data.district === validAddress.district &&
    fullAddress.data.area === validAddress.area &&
    fullAddress.data.fullAddress === validAddress.fullAddress &&
    fullAddress.data.landmark === validAddress.landmark &&
    fullAddress.data.isDefault === validAddress.isDefault,
  fullAddress.success ? JSON.stringify(fullAddress.data) : "parse failed",
);
check("landmark may be omitted", addressSchema.safeParse({ ...validAddress, landmark: undefined }).success);
check("landmark may be an empty string", addressSchema.safeParse({ ...validAddress, landmark: "" }).success);
check("isDefault may be omitted", addressSchema.safeParse({ ...validAddress, isDefault: undefined }).success);
check(
  "the widest phone charset the regex allows is accepted",
  addressSchema.safeParse({ ...validAddress, phone: "+880 17-1234 (567)" }).success,
);

/* ── B. addressSchema rejects with the exact message ──────────────────────── */

section("B. addressSchema rejects invalid input");

const emptyForm = addressSchema.safeParse(EMPTY_ADDRESS_FORM);
check("the initial (empty) form state is rejected", !emptyForm.success);
check(
  "the empty form reports the name message first",
  messageFor(emptyForm, "name") === MSG.name,
  messageFor(emptyForm, "name"),
);
check(
  "the empty form reports a message for every required field",
  ["name", "phone", "division", "district", "area", "fullAddress"].every((field) => messageFor(emptyForm, field) !== ""),
  messagesOf(emptyForm).join(" | "),
);

const shortName = addressSchema.safeParse({ ...validAddress, name: "A" });
check("a one-character name is rejected", !shortName.success);
check("short name carries the exact message", messageFor(shortName, "name") === MSG.name, messageFor(shortName, "name"));

const shortPhone = addressSchema.safeParse({ ...validAddress, phone: "123" });
check("a too-short phone is rejected", !shortPhone.success);
check(
  "short phone carries the exact message",
  messageFor(shortPhone, "phone") === MSG.phoneShort,
  messageFor(shortPhone, "phone"),
);

// Exactly 10 characters, so `.min(10)` passes and the charset regex is what rejects.
const badCharsPhone = addressSchema.safeParse({ ...validAddress, phone: "abcdefghij" });
check("a 10-character phone with letters is rejected", !badCharsPhone.success);
check(
  "disallowed phone characters carry the exact message",
  messageFor(badCharsPhone, "phone") === MSG.phoneChars,
  messageFor(badCharsPhone, "phone"),
);

const cases: [string, Record<string, unknown>, string, string][] = [
  ["division", { division: "" }, "division", MSG.division],
  ["district", { district: "" }, "district", MSG.district],
  ["area", { area: "x" }, "area", MSG.area],
  ["fullAddress", { fullAddress: "abcd" }, "fullAddress", MSG.fullAddress],
];

for (const [label, patch, field, expected] of cases) {
  const result = addressSchema.safeParse({ ...validAddress, ...patch });
  check(
    `${label} below its minimum carries the exact message`,
    !result.success && messageFor(result, field) === expected,
    messageFor(result, field),
  );
}

const missingName = addressSchema.safeParse(
  Object.fromEntries(Object.entries(validAddress).filter(([key]) => key !== "name")),
);
check("a missing required field is rejected", !missingName.success);
check(
  "a missing field maps its issue to that field's path",
  messageFor(missingName, "name") !== "",
  issuesOf(missingName)
    .map((issue) => issue.path.join(".") || "(root)")
    .join(" | "),
);

/* ── C. Error shape, which the forms depend on ────────────────────────────── */

section("C. Error shape for form mapping");

const twoErrors = addressSchema.safeParse({ ...validAddress, name: "A", area: "x" });
check("multiple problems are reported together", messagesOf(twoErrors).length === 2, messagesOf(twoErrors).join(" | "));
check(
  "error exposes a .issues array",
  !twoErrors.success && Array.isArray(twoErrors.error.issues),
);
check(
  "issues carry field paths that resolve to the right fields",
  messageFor(twoErrors, "name") === MSG.name && messageFor(twoErrors, "area") === MSG.area,
);
check(
  "issues carry no root-level path when every problem belongs to a field",
  issuesOf(twoErrors).every((issue) => issue.path.length > 0),
);

/* ── D. .trim() still transforms, and in what order ───────────────────────── */

section("D. .trim() behaviour");

const padded = addressSchema.safeParse({ ...validAddress, name: "  Ayesha Rahman  " });
check("a padded name parses", padded.success, messagesOf(padded).join(" | "));
check(
  "trim() strips surrounding whitespace from the parsed value",
  padded.success && padded.data.name === "Ayesha Rahman",
  padded.success ? JSON.stringify(padded.data.name) : "parse failed",
);
check(
  "trim() applies before the length check, so whitespace cannot satisfy a minimum",
  !addressSchema.safeParse({ ...validAddress, name: "  A  " }).success,
);

/* ── E. checkoutSchema ────────────────────────────────────────────────────── */

section("E. checkoutSchema");

const checkoutOk = checkoutSchema.safeParse(validCheckout);
check("a valid checkout payload parses", checkoutOk.success, messagesOf(checkoutOk).join(" | "));
check(
  "checkout uses `address`, not `fullAddress`",
  Object.keys(checkoutSchema.shape).includes("address") && !Object.keys(checkoutSchema.shape).includes("fullAddress"),
);

const checkoutShortAddress = checkoutSchema.safeParse({ ...validCheckout, address: "abc" });
check("a too-short delivery address is rejected", !checkoutShortAddress.success);
check(
  "short delivery address carries the exact message",
  messageFor(checkoutShortAddress, "address") === MSG.address,
  messageFor(checkoutShortAddress, "address"),
);

const checkoutEmpty = checkoutSchema.safeParse({});
check("an empty checkout payload is rejected", !checkoutEmpty.success);
check(
  "checkout does not mark isDefault as required",
  !issuesOf(checkoutEmpty).some((issue) => issue.path.join(".") === "isDefault"),
);

/* ── F. Controls ──────────────────────────────────────────────────────────── */

section("F. Controls");

// The rejections above must come from the schemas' constraints, not from the
// payloads being unparseable as strings or objects.
check("control: a bare z.string() accepts the one-character name the schema rejects", z.string().safeParse("A").success);
check("control: a bare z.object({}) accepts the payload the schema rejects", z.object({}).safeParse(validAddress).success);
check(
  "control: the schema's field list matches the form's initial state",
  Object.keys(addressSchema.shape).sort().join(",") === Object.keys(EMPTY_ADDRESS_FORM).sort().join(","),
  `${Object.keys(addressSchema.shape).sort().join(",")} vs ${Object.keys(EMPTY_ADDRESS_FORM).sort().join(",")}`,
);
check(
  "control: every asserted message is non-empty and free of unfilled placeholders",
  Object.values(MSG).every((message) => message.length > 0 && !message.includes("${")),
);

/* ── Result ───────────────────────────────────────────────────────────────── */

console.log(`\n${failures.length === 0 ? "PASS" : "FAIL"} — ${failures.length} failure(s)`);

if (failures.length > 0) {
  process.exitCode = 1;
}
