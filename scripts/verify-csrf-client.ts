/**
 * P1.1 — frontend CSRF client behaviour.
 *
 * Run with: npm run verify:csrf-client  (Node >= 23.6, or Node 22.18+)
 *
 * This harness drives the REAL axios instance from `src/lib/axios.ts` through a
 * scripted adapter — the real request interceptor, the real response
 * interceptor, the real re-sync handler and the real token store. It does not
 * re-implement the retry logic, because a harness that mirrors the app only
 * proves the mirror.
 *
 * The behaviour under test is a loop bound: a stale token must be retried
 * exactly once, a second rejection must surface to the user, and a 403 from any
 * other control must never be retried at all. An unbounded retry here is a
 * request storm, so each of those is asserted separately, and a negative
 * control confirms that a request which never fails is not retried.
 *
 * Node runs the TypeScript directly by stripping types, so this file must stay
 * erasable (no enums, no namespaces, no parameter properties).
 *
 * Exits non-zero if any check fails.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import api from "../src/lib/axios.ts";
import {
  CSRF_HEADER,
  CSRF_REJECTED_MESSAGE,
  clearCsrfToken,
  getCsrfToken,
  isCsrfRejection,
  setCsrfToken,
  shouldRetryCsrf,
} from "../src/lib/csrf.ts";

const CSRF_REJECTED_BODY = { success: false, message: CSRF_REJECTED_MESSAGE };
/** What the Origin guard answers. Must never trigger a retry. */
const ORIGIN_REJECTED_BODY = { success: false, message: "Request blocked — untrusted origin" };
const CORS_REJECTED_BODY = { success: false, message: "Origin not allowed" };

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

const describeError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return `AxiosError(status=${String(error.response?.status)})`;
  }

  return error instanceof Error ? error.message : String(error);
};

/**
 * Strips comment-ONLY lines so the hygiene checks read code, not prose.
 *
 * `src/lib/csrf.ts` documents the rule it follows ("never localStorage, never
 * sessionStorage"), and a raw text search matches that documentation — which is
 * how this harness first reported a violation that did not exist.
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

/* ───────────────────────── scripted axios adapter ───────────────────────── */

type Attempt = {
  method: string;
  url: string;
  csrf: string | undefined;
  /** Serialised request body, so an idempotency key can be checked across a retry. */
  body: string | undefined;
};

type Outcome = {
  status: number;
  body: unknown;
};

let script: Outcome[] = [];
const attempts: Attempt[] = [];

const headerOf = (config: InternalAxiosRequestConfig, name: string): string | undefined => {
  const value: unknown = config.headers.get(name);

  return typeof value === "string" && value.length > 0 ? value : undefined;
};

/**
 * Replaces the network with a script. Each request consumes the next outcome.
 * Exhausting the script throws, so a runaway retry loop fails loudly instead of
 * silently reusing a response.
 */
const installAdapter = (outcomes: Outcome[]): void => {
  script = outcomes;
  attempts.length = 0;

  api.defaults.adapter = async (config) => {
    const outcome = script.shift();

    attempts.push({
      method: (config.method ?? "").toUpperCase(),
      url: config.url ?? "",
      csrf: headerOf(config, CSRF_HEADER),
      body: typeof config.data === "string" ? config.data : undefined,
    });

    if (outcome === undefined) {
      throw new AxiosError("harness: the request script is exhausted (retry loop?)", "HARNESS");
    }

    const response: AxiosResponse = {
      data: outcome.body,
      status: outcome.status,
      statusText: "",
      headers: {},
      config,
    };

    if (outcome.status < 400) {
      return response;
    }

    throw new AxiosError(
      `Request failed with status code ${outcome.status}`,
      "ERR_BAD_REQUEST",
      config,
      undefined,
      response
    );
  };
};

const ok = (body: unknown): Outcome => ({ status: 200, body });
const forbidden = (body: unknown): Outcome => ({ status: 403, body });
const unauthorized: Outcome = { status: 401, body: { success: false, message: "Not authorized" } };

/** Fresh token `/auth/me` hands back during a re-sync. */
const ME_WITH_FRESH_TOKEN = ok({ success: true, message: "Token is valid!", csrfToken: "fresh-token" });

/* ───────────────────────────── checks ───────────────────────────── */

const main = async (): Promise<void> => {
  /* ── A. rejection discrimination ───────────────────────────────────── */
  section("A. Only the CSRF 403 counts as one");

  check(
    "a 403 carrying the CSRF message is a CSRF rejection",
    isCsrfRejection(403, CSRF_REJECTED_BODY),
    "the CSRF 403 was not recognised"
  );
  check(
    "a 403 from the Origin guard is not a CSRF rejection",
    !isCsrfRejection(403, ORIGIN_REJECTED_BODY) && !isCsrfRejection(403, CORS_REJECTED_BODY),
    "an origin 403 would be retried"
  );
  check(
    "a 403 with no body, a null body or a string body is not a CSRF rejection",
    !isCsrfRejection(403, undefined) && !isCsrfRejection(403, null) && !isCsrfRejection(403, "Forbidden"),
    "a bodiless 403 would be retried"
  );
  check(
    "the same message on a different status is not a CSRF rejection",
    !isCsrfRejection(200, CSRF_REJECTED_BODY) && !isCsrfRejection(401, CSRF_REJECTED_BODY),
    "the status is being ignored"
  );
  check(
    "a missing status is not a CSRF rejection",
    !isCsrfRejection(undefined, CSRF_REJECTED_BODY),
    "an unknown status would be retried"
  );

  /* ── B. retry bound ────────────────────────────────────────────────── */
  section("B. The retry fires at most once");

  check(
    "the first CSRF 403 is retried",
    shouldRetryCsrf(403, CSRF_REJECTED_BODY, false),
    "a stale token is never retried"
  );
  check(
    "the second CSRF 403 is NOT retried — it surfaces",
    !shouldRetryCsrf(403, CSRF_REJECTED_BODY, true),
    "the retry is unbounded"
  );
  check(
    "a non-CSRF 403 is never retried, first attempt or not",
    !shouldRetryCsrf(403, ORIGIN_REJECTED_BODY, false) && !shouldRetryCsrf(403, ORIGIN_REJECTED_BODY, true),
    "an origin 403 would be retried"
  );
  check(
    "a non-403 is never retried",
    !shouldRetryCsrf(500, CSRF_REJECTED_BODY, false) && !shouldRetryCsrf(undefined, CSRF_REJECTED_BODY, false),
    "a non-403 would be retried"
  );

  /* ── C. the real interceptor: recover ──────────────────────────────── */
  section("C. A stale token is recovered, once");

  installAdapter([forbidden(CSRF_REJECTED_BODY), ME_WITH_FRESH_TOKEN, ok({ success: true })]);
  setCsrfToken("stale-token");

  const recovered = await api.post("/orders", { item: "probe" });

  check(
    "the retried request succeeds",
    recovered.status === 200 && recovered.data !== null,
    `status ${recovered.status}`
  );
  check(
    "exactly three requests were made: the 403, one /auth/me, one retry",
    attempts.length === 3,
    attempts.map((attempt) => `${attempt.method} ${attempt.url}`).join(" | ")
  );
  check(
    "the first attempt carried the stale token",
    attempts[0]?.csrf === "stale-token",
    `sent "${String(attempts[0]?.csrf)}"`
  );
  check(
    "the re-sync called /auth/me (no extra endpoint was invented)",
    attempts[1]?.method === "GET" && attempts[1]?.url === "/auth/me",
    `${String(attempts[1]?.method)} ${String(attempts[1]?.url)}`
  );
  check(
    "the retry carried the refreshed token",
    attempts[2]?.csrf === "fresh-token",
    `sent "${String(attempts[2]?.csrf)}"`
  );

  /* ── D. the real interceptor: do not loop ──────────────────────────── */
  section("D. Two consecutive 403s do not loop");

  installAdapter([
    forbidden(CSRF_REJECTED_BODY),
    ME_WITH_FRESH_TOKEN,
    forbidden(CSRF_REJECTED_BODY),
  ]);
  setCsrfToken("stale-token");

  let loopError: unknown = null;

  try {
    await api.post("/orders", { item: "probe" });
  } catch (error) {
    loopError = error;
  }

  check(
    "the second 403 surfaces to the caller",
    loopError instanceof AxiosError && loopError.response?.status === 403,
    `rejected with ${describeError(loopError)}`
  );
  check(
    "the second 403 body is the CSRF rejection, not a harness artifact",
    loopError instanceof AxiosError && isCsrfRejection(loopError.response?.status, loopError.response?.data),
    `body ${JSON.stringify(loopError instanceof AxiosError ? loopError.response?.data : null)}`
  );
  check(
    "exactly three requests were made — no fourth attempt, no infinite loop",
    attempts.length === 3,
    `${attempts.length}: ${attempts.map((attempt) => `${attempt.method} ${attempt.url}`).join(" | ")}`
  );
  check(
    "the re-sync ran exactly once, not once per failure",
    attempts.filter((attempt) => attempt.url === "/auth/me").length === 1,
    attempts.map((attempt) => attempt.url).join(" | ")
  );

  /* ── E. the real interceptor: other 403s ───────────────────────────── */
  section("E. A 403 from another control is passed straight through");

  installAdapter([forbidden(ORIGIN_REJECTED_BODY)]);
  setCsrfToken("current-token");

  let originError: unknown = null;

  try {
    await api.post("/orders", { item: "probe" });
  } catch (error) {
    originError = error;
  }

  check(
    "the origin 403 is surfaced unchanged",
    originError instanceof AxiosError && originError.response?.data === ORIGIN_REJECTED_BODY,
    describeError(originError)
  );
  check(
    "no retry was attempted and /auth/me was never called",
    attempts.length === 1,
    `${attempts.length}: ${attempts.map((attempt) => attempt.url).join(" | ")}`
  );

  /* ── F. the real interceptor: give up cleanly ──────────────────────── */
  section("F. A failed re-sync gives up instead of retrying");

  installAdapter([forbidden(CSRF_REJECTED_BODY), unauthorized]);
  setCsrfToken("stale-token");

  let signedOutError: unknown = null;

  try {
    await api.post("/orders", { item: "probe" });
  } catch (error) {
    signedOutError = error;
  }

  check(
    "the original 403 is surfaced, not the 401 from /auth/me",
    signedOutError instanceof AxiosError && signedOutError.response?.status === 403,
    describeError(signedOutError)
  );
  check(
    "the request was not retried after the session could not be re-read",
    attempts.length === 2 && attempts.filter((attempt) => attempt.method === "POST").length === 1,
    `${attempts.length}: ${attempts.map((attempt) => `${attempt.method} ${attempt.url}`).join(" | ")}`
  );
  check(
    "the in-memory token was dropped with the session",
    getCsrfToken() === null,
    `token still held: ${getCsrfToken() === null ? "no" : "YES"}`
  );

  /* ── G. the real interceptor: no token where none is needed ────────── */
  section("G. Reads are untouched");

  installAdapter([ok({ status: "ok" })]);
  setCsrfToken("current-token");

  const read = await api.get("/products");

  check(
    "a GET succeeds and is not given the CSRF header (the backend never checks one)",
    read.status === 200 && attempts[0]?.csrf === undefined,
    `method ${String(attempts[0]?.method)} sent "${String(attempts[0]?.csrf)}"`
  );

  installAdapter([unauthorized]);
  setCsrfToken("current-token");

  let expiredError: unknown = null;

  try {
    await api.post("/orders", { item: "probe" });
  } catch (error) {
    expiredError = error;
  }

  check(
    "a 401 is surfaced and drops the token (the session it was derived from is gone)",
    expiredError instanceof AxiosError &&
      expiredError.response?.status === 401 &&
      getCsrfToken() === null,
    describeError(expiredError)
  );

  /* ── H. negative control ───────────────────────────────────────────── */
  section("H. Negative control");

  installAdapter([ok({ success: true })]);
  setCsrfToken("current-token");

  const success = await api.post("/orders", { item: "probe" });

  check(
    "NC: a request that never fails is not retried (the retry is triggered by the 403, not by writes)",
    success.status === 200 && attempts.length === 1,
    `${attempts.length}: ${attempts.map((attempt) => attempt.url).join(" | ")}`
  );
  check(
    "NC: and it carried the token on the single attempt it made",
    attempts[0]?.csrf === "current-token",
    `sent "${String(attempts[0]?.csrf)}"`
  );

  /* ── I. hygiene ────────────────────────────────────────────────────── */
  section("I. The token never leaves memory");

  const csrfSource = stripCommentLines(
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "csrf.ts"), "utf8")
  );

  check(
    "the token is not persisted to localStorage or sessionStorage",
    !/localStorage|sessionStorage/.test(csrfSource),
    "the CSRF module touches web storage"
  );
  check(
    "the token is not written to a document cookie",
    !/document\.cookie/.test(csrfSource),
    "the CSRF module writes a cookie"
  );
  check(
    "the token is never logged, in any environment",
    !/console\./.test(csrfSource),
    "the CSRF module logs"
  );
  check(
    "the module holds the token in a module-scope binding, not a global",
    /let csrfToken: string \| null = null;/.test(csrfSource) &&
      !/window\.|globalThis\./.test(csrfSource),
    "the token lives somewhere longer-lived than the module"
  );
  check(
    "clearing really clears",
    (clearCsrfToken(), getCsrfToken() === null),
    "the token survived a clear"
  );

  /* ── J. checkout idempotency across the CSRF retry (P1.3, R1) ─────── */
  section("J. A CSRF retry must reuse the checkout idempotency key");

  const CHECKOUT_KEY = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
  const checkoutPayload = {
    idempotencyKey: CHECKOUT_KEY,
    items: [{ itemId: "507f1f77bcf86cd799439011", itemType: "product", quantity: 1 }],
    paymentMethod: "cash_on_delivery",
  };

  installAdapter([forbidden(CSRF_REJECTED_BODY), ME_WITH_FRESH_TOKEN, ok({ success: true, order: {} })]);
  setCsrfToken("stale-token");

  const checkout = await api.post("/orders", checkoutPayload);

  const keyOf = (attempt: Attempt | undefined): string | undefined => {
    if (attempt?.body === undefined) return undefined;

    try {
      return (JSON.parse(attempt.body) as { idempotencyKey?: string }).idempotencyKey;
    } catch {
      return undefined;
    }
  };

  check(
    "the checkout succeeds after the 403 -> re-sync -> retry sequence",
    checkout.status === 200,
    `status ${checkout.status}`
  );
  check(
    "it made exactly two POSTs to /orders: the rejected one and one retry",
    attempts.filter((attempt) => attempt.url === "/orders").length === 2,
    attempts.map((attempt) => `${attempt.method} ${attempt.url}`).join(" | ")
  );
  check(
    "the first attempt carried the idempotency key",
    keyOf(attempts.find((attempt) => attempt.url === "/orders")) === CHECKOUT_KEY,
    `sent ${String(keyOf(attempts.find((attempt) => attempt.url === "/orders")))}`
  );
  check(
    "NC: the retried request carried the SAME key, so the server returns the existing order",
    keyOf([...attempts].reverse().find((attempt) => attempt.url === "/orders")) === CHECKOUT_KEY,
    `retry sent ${String(keyOf([...attempts].reverse().find((attempt) => attempt.url === "/orders")))} — a new key here would create a second order`
  );
  check(
    "and the retry body is otherwise the same request (the payload object is reused, not rebuilt)",
    attempts.filter((attempt) => attempt.url === "/orders")[0]?.body ===
      attempts.filter((attempt) => attempt.url === "/orders")[1]?.body,
    "the payload was rebuilt between attempts"
  );

  const checkoutPageSource = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "(public)", "checkout", "page.tsx"),
    "utf8"
  );

  check(
    "the checkout page generates the key once per attempt, not per request",
    (checkoutPageSource.match(/crypto\.randomUUID\(\)/g) ?? []).length === 1,
    `${(checkoutPageSource.match(/crypto\.randomUUID\(\)/g) ?? []).length} generators`
  );
  check(
    "and passes it in the order payload",
    /idempotencyKey,/.test(checkoutPageSource) && /idempotencyKey\?: string;/.test(
      readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "types", "order.ts"), "utf8")
    ),
    "the key is not sent (or is not typed on the payload)"
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

  console.log("All frontend CSRF checks passed.");
};

void main();
