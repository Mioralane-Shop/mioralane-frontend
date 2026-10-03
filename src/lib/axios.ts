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

const STATE_CHANGING_METHODS = new Set(["post", "put", "patch", "delete"]);

/** A request config that has already spent its single CSRF retry. */
type CsrfAwareConfig = InternalAxiosRequestConfig & { csrfRetried?: boolean };

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ── CSRF token: attach (P1.1) ────────────────────────────────────────────────
// Read at request time, not at creation time, so a token obtained by a login or
// by the `/auth/me` re-sync is picked up by very next request.
api.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();
  const token = getCsrfToken();

  if (token !== null && STATE_CHANGING_METHODS.has(method)) {
    config.headers.set(CSRF_HEADER, token);
  }

  return config;
});

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
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Cleared unconditionally: the session this token was derived from is gone,
      // so the token can never verify again. Only the redirect/localStorage part
      // is browser-only.
      clearCsrfToken();

      if (typeof window !== "undefined") {
        handleUnauthorizedSession();
      }

      return Promise.reject(error);
    }

    const config = error.config as CsrfAwareConfig | undefined;

    if (config && shouldRetryCsrf(error.response?.status, error.response?.data, config.csrfRetried === true)) {
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
