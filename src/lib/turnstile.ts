/**
 * Storefront half of Cloudflare Turnstile (invisible mode).
 *
 * The widget itself lives in `components/providers/bot-protection.tsx`; this
 * module owns the three things the rest of the app needs:
 *
 *   1. the public site key,
 *   2. a ONE-SHOT token store the axios interceptor drains onto writes, and
 *   3. the session flag the protected actions consult before they submit at all.
 *
 * ## Two layers, and which one is the control
 *
 * The session flag is a *UX* affordance: it only proves a challenge completed in
 * THIS tab, and `sessionStorage` is client-controlled. The actual control is
 * server-side — `requireTurnstile` on the API now refuses a token-less write, and
 * `POST /api/verify-turnstile` is where a token is exchanged with Cloudflare. The
 * flag exists so a visitor is not told "security check required" after they have
 * already typed their password.
 *
 * ## Why the token is spent on SEND, not on success
 *
 * Cloudflare redeems a token the moment Siteverify sees it — one token, one
 * validation, no exceptions. A token kept "until the request succeeds" is
 * therefore already dead on the next attempt, so a single wrong password would
 * leave the client looping `TURNSTILE_FAILED` forever. The token is cleared as
 * soon as it is attached to a request, and `refreshTurnstile()` mints the next
 * one. See the interceptor in `lib/axios.ts` for how that still leaves the CSRF
 * retry with a usable token.
 */

/**
 * The public site key. `NEXT_PUBLIC_*` values are INLINED AT BUILD TIME, so an
 * unset key is a build-time absence, not a runtime one.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** `sessionStorage` key holding the "challenge solved this session" flag. */
export const TURNSTILE_VERIFIED_KEY = "turnstile_verified";

/** Header the API reads. Must be in the API's CORS allowlist. */
export const TURNSTILE_HEADER = "X-Turnstile-Token";

/** `code` values `requireTurnstile` answers a refused write with. */
export const TURNSTILE_MISSING_CODE = "TURNSTILE_MISSING";
export const TURNSTILE_FAILED_CODE = "TURNSTILE_FAILED";

/**
 * Whether this build has a site key at all.
 *
 * A build with no key (CI, a preview, a fresh checkout) renders no widget, so
 * nothing can ever set the flag. Treating that as "unverified" would lock every
 * one of those builds out of login, registration and checkout — so
 * {@link isBotProtectionSatisfied} fails OPEN when, and only when, the feature is
 * not configured.
 */
export const isTurnstileConfigured = (): boolean => TURNSTILE_SITE_KEY.trim().length > 0;

/** `window` is absent during SSR, and `sessionStorage` can throw in privacy modes. */
const storage = (): Storage | null => {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/** Records that a challenge has been solved for this browser session. */
export const markTurnstileVerified = (): void => {
  try {
    storage()?.setItem(TURNSTILE_VERIFIED_KEY, "true");
  } catch {
    // Storage blocked: the widget still runs, the gate simply stays closed.
  }
};

/** Clears the flag — a token expired, or the challenge failed. */
export const clearTurnstileVerification = (): void => {
  try {
    storage()?.removeItem(TURNSTILE_VERIFIED_KEY);
  } catch {
    // See `markTurnstileVerified`.
  }
};

/**
 * The gate the protected actions call before they proceed.
 *
 * `true` when the challenge has been solved for this session, or when the feature
 * is not configured at all (see {@link isTurnstileConfigured}).
 */
export const isBotProtectionSatisfied = (): boolean => {
  if (!isTurnstileConfigured()) return true;

  try {
    return storage()?.getItem(TURNSTILE_VERIFIED_KEY) === "true";
  } catch {
    return false;
  }
};

/* ── The one-shot token ───────────────────────────────────────────────────── */

/**
 * The current token, in memory only.
 *
 * Deliberately not `sessionStorage`: unlike the flag, this is a credential the
 * server accepts, and a persisted one is a credential that outlives the tab.
 * Accessed through {@link setTurnstileToken}/{@link getTurnstileToken} so the
 * axios interceptor can be tested without a browser.
 */
let turnstileToken: string | null = null;

/** Called by the widget's `onSuccess`. Anything that is not a token clears it. */
export const setTurnstileToken = (token: unknown): void => {
  turnstileToken = typeof token === "string" && token.length > 0 ? token : null;
};

export function getTurnstileToken(): string | null {
  return turnstileToken;
}

export const clearTurnstileToken = (): void => {
  turnstileToken = null;
};

/**
 * True only for the security check's own 400.
 *
 * The status alone is not enough — the API answers 400 for validation and for
 * coupon rules too — so the `code` is part of the match, exactly as
 * `isCsrfRejection` does for its 403.
 */
export const isTurnstileRejection = (status: number | undefined, body: unknown): boolean => {
  if (status !== 400 || typeof body !== "object" || body === null) {
    return false;
  }

  const code = (body as { code?: unknown }).code;

  return code === TURNSTILE_MISSING_CODE || code === TURNSTILE_FAILED_CODE;
};

/**
 * Asks the widget for a fresh challenge.
 *
 * Safe to call at any time: no widget mounted (a keyless build), a blocked
 * Cloudflare script, or a widget already mid-challenge are all no-ops rather
 * than throws. The next token arrives through the widget's `onSuccess`.
 */
export const refreshTurnstile = (): void => {
  if (typeof window === "undefined") return;

  try {
    window.turnstile?.reset();
  } catch {
    // Nothing to reset.
  }
};
