/**
 * Storefront half of Cloudflare Turnstile (invisible mode).
 *
 * The widget itself lives in `components/providers/bot-protection.tsx`; this
 * module owns the two things the rest of the app needs: the public site key, and
 * the session flag the protected actions (sign in, register, checkout) consult
 * before they proceed.
 *
 * The flag is a *UX* gate, not the security boundary — it only proves a challenge
 * completed in THIS tab, and sessionStorage is client-controlled. The server-side
 * control is `POST /api/verify-turnstile` (mioralane-backend), which is where a
 * token is actually exchanged and validated. Wiring the two together is a
 * deliberate follow-up; this module is what keeps that wiring a one-line change.
 */

/**
 * The public site key. `NEXT_PUBLIC_*` values are INLINED AT BUILD TIME, so an
 * unset key is a build-time absence, not a runtime one.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** `sessionStorage` key holding the "challenge solved this session" flag. */
export const TURNSTILE_VERIFIED_KEY = "turnstile_verified";

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
