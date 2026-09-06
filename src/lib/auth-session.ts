const LEGACY_AUTH_KEYS = ["mioralane-token", "mioralane-user", "mioralane-auth"];
let clearAuthState: (() => void) | null = null;

export function clearLegacyAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of LEGACY_AUTH_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export function registerAuthStateClearer(clearer: () => void): void {
  clearAuthState = clearer;
}

export function handleUnauthorizedSession(): void {
  clearLegacyAuthStorage();
  clearAuthState?.();
}
