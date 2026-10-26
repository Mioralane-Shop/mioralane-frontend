/**
 * CSRF token plumbing for the API client (P1.1).
 *
 * The storefront and the API are on different sites in production
 * (`mioralane.com` vs `mioralane-backend.vercel.app`), so the auth cookie is
 * issued with `SameSite=None` and the browser will happily attach it to a
 * forged cross-site request. The backend therefore also requires an
 * `X-CSRF-Token` header whose value is derived from the session. Only a real
 * client of this session can obtain that value, and it is delivered in the JSON
 * body of `/auth/login`, `/auth/register`, `/auth/google` and `/auth/me`.
 *
 * Two rules are load-bearing here:
 *
 *   1. **Memory only.** Never `localStorage`, never `sessionStorage`, never a
 *      cookie. A persisted token survives the tab, a shared machine and an XSS
 *      payload; an in-memory one dies with the tab, and `/auth/me` (which this
 *      app already calls on boot) hands out a fresh one.
 *   2. **Never logged.** Not even in development. A token in a console line is a
 *      credential in a screenshot, a bug report and a log aggregator.
 */

/** Header the backend reads. Must be in the API's CORS allowlist. */
export const CSRF_HEADER = "X-CSRF-Token";

/** The backend's message when the token is missing or does not match. */
export const CSRF_REJECTED_MESSAGE = "CSRF token invalid or missing";

let csrfToken: string | null = null;
let resync: (() => Promise<boolean>) | null = null;

/** Stores the token from an auth response body. Anything else clears it. */
export const setCsrfToken = (token: unknown): void => {
  csrfToken = typeof token === "string" && token.length > 0 ? token : null;
};

export const getCsrfToken = (): string | null => csrfToken;

export const clearCsrfToken = (): void => {
  csrfToken = null;
};

/**
 * True only for the CSRF guard's own 403.
 *
 * The status alone is not enough: the API answers 403 for an untrusted Origin
 * and for route guards too. Re-syncing on one of those would retry a request
 * that can never succeed, so the message is part of the match.
 */
export const isCsrfRejection = (status: number | undefined, body: unknown): boolean => {
  if (status !== 403 || typeof body !== "object" || body === null) {
    return false;
  }

  return (body as { message?: unknown }).message === CSRF_REJECTED_MESSAGE;
};

/**
 * The retry is bounded to one attempt per request and only ever fires for a
 * stale token. `alreadyRetried` is what stops a loop: if the re-synced token is
 * rejected too, the second 403 reaches the caller instead of retrying again.
 */
export const shouldRetryCsrf = (
  status: number | undefined,
  body: unknown,
  alreadyRetried: boolean
): boolean => !alreadyRetried && isCsrfRejection(status, body);

/**
 * Registers how to obtain a fresh token. The client owner supplies this because
 * the CSRF module must not import the axios instance (the instance imports this
 * module — the dependency would be circular).
 */
export const registerCsrfResync = (handler: () => Promise<boolean>): void => {
  resync = handler;
};

/**
 * Asks for a fresh token. `false` means "give up": no handler, or the session
 * could not be re-read (the user was signed out). A caller must not retry after
 * a `false`.
 */
export const resyncCsrfToken = async (): Promise<boolean> => {
  if (resync === null) {
    return false;
  }

  return resync();
};
