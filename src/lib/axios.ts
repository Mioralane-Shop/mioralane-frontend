import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
// Explicit .ts extension: required by the CSRF client harness, which imports
// these modules directly to test the interceptor logic without a browser.
// This requires allowImportingTsExtensions in tsconfig.json.
import { handleUnauthorizedSession } from "./auth-session.ts";
import {
  CSRF_HEADER,
  clearCsrfToken,
  getCsrfToken,
  registerCsrfResync,
  resyncCsrfToken,
  setCsrfToken,
  shouldRetryCsrf,
} from "./csrf.ts";
import {
  TURNSTILE_HEADER,
  clearTurnstileToken,
  getTurnstileToken,
  isTurnstileRejection,
  refreshTurnstile,
} from "./turnstile.ts";

const STATE_CHANGING_METHODS = new Set(["post", "put", "patch", "delete"]);

/** A request config that has already spent its single CSRF retry. */
type CsrfAwareConfig = InternalAxiosRequestConfig & { csrfRetried?: boolean };

/** The same config, plus whether it carried a single-use Turnstile token. */
type TurnstileAwareConfig = CsrfAwareConfig & { turnstileSent?: boolean };

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ── CSRF + Turnstile tokens: attach ──────────────────────────────────────────
// Both are read at request time, not at creation time, so a token obtained by a
// login or by the `/auth/me` re-sync is picked up by the very next request.
api.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();

  if (!STATE_CHANGING_METHODS.has(method)) {
    return config;
  }

  const csrfToken = getCsrfToken();

  if (csrfToken !== null) {
    config.headers.set(CSRF_HEADER, csrfToken);
  }

  // Turnstile is SINGLE-USE, and it is spent here — on send — rather than on a
  // 2xx. Cloudflare redeems the token the moment Siteverify sees it, so a token
  // kept "until the request succeeds" is already dead on the next attempt: one
  // wrong password would leave every retry failing TURNSTILE_FAILED.
  //
  // Spending it up front does NOT break the CSRF retry below. That retry
  // re-issues this same config object, whose headers already carry the token,
  // and the token is still unused because the CSRF guard refuses before any
  // route — and therefore before `requireTurnstile` — runs.
  const turnstileToken = getTurnstileToken();

  if (turnstileToken !== null) {
    config.headers.set(TURNSTILE_HEADER, turnstileToken);
    clearTurnstileToken();
    (config as TurnstileAwareConfig).turnstileSent = true;
  }

  return config;
});

/**
 * Mints a fresh challenge once the current request is done with its token.
 *
 * Runs after every response — success or failure — because the token is spent
 * either way and the visitor's NEXT attempt needs the new one ready. Two
 * exceptions, both deliberate:
 *
 *   - a CSRF retry that is about to be issued skips the refresh, because that
 *     retry re-sends the token this request carried and resetting the widget
 *     could invalidate it mid-flight;
 *   - an ordinary error that carried no token is a no-op, so a stray 404 does
 *     not spin the widget.
 */
const settleTurnstile = (
  config: unknown,
  refusedByTurnstile: boolean,
  retryingCsrf: boolean
): void => {
  if (retryingCsrf) return;

  const spentToken = (config as TurnstileAwareConfig | undefined)?.turnstileSent === true;

  if (spentToken || refusedByTurnstile) {
    refreshTurnstile();
  }
};

/**
 * Recovers a stale token.
 *
 * A token is bound to the session, so it goes stale when the session rotates:
 * a page reload drops it (memory only), and a sign-in from another tab replaces
 * the cookie. `/auth/me` returns a fresh one, which keeps the recovery to a call
 * this app already makes on boot.
 *
 * Resolves `false` when the session cannot be re-read — the caller must then
 * give up rather than retry, or a signed-out user would loop forever.
 */
registerCsrfResync(async () => {
  try {
    const { data } = await api.get<{ csrfToken?: string | null }>("/auth/me");
    setCsrfToken(data.csrfToken);

    return getCsrfToken() !== null;
  } catch {
    clearCsrfToken();

    return false;
  }
});

api.interceptors.response.use(
  (response) => {
    settleTurnstile(response.config, false, false);

    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const body: unknown = error.response?.data;
    const config = error.config as TurnstileAwareConfig | undefined;

    if (status === 401) {
      // Cleared unconditionally: the session this token was derived from is gone,
      // so the token can never verify again. Only the redirect/localStorage part
      // is browser-only.
      clearCsrfToken();

      settleTurnstile(config, false, false);

      if (typeof window !== "undefined") {
        handleUnauthorizedSession();
      }

      return Promise.reject(error);
    }

    const retryingCsrf =
      config !== undefined && shouldRetryCsrf(status, body, config.csrfRetried === true);

    settleTurnstile(config, isTurnstileRejection(status, body), retryingCsrf);

    if (config && retryingCsrf) {
      // Marked BEFORE awaiting the re-sync: a retry that fails must surface its
      // own 403 instead of starting another round trip.
      config.csrfRetried = true;

      if (await resyncCsrfToken()) {
        return api.request(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
