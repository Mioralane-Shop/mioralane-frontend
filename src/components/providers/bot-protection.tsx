"use client";

import { useCallback, useEffect, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  TURNSTILE_SITE_KEY,
  clearTurnstileToken,
  clearTurnstileVerification,
  markTurnstileVerified,
  setTurnstileToken,
} from "@/lib/turnstile";

/**
 * Invisible Cloudflare Turnstile widget, mounted once in the root layout.
 *
 * Mounting it app-wide is intentional and matches Cloudflare's own advice to
 * start the challenge as early as possible, so the token is ready by the time a
 * visitor submits a form. It does NOT gate the site: nothing is blocked on this
 * component — it only sets the session flag that the protected actions check. A
 * crawler therefore sees exactly what it saw before.
 *
 * Retry policy: Cloudflare's own auto-retry and auto-refresh are turned OFF and
 * handled here instead, so the behaviour is one bounded, testable path. A failure
 * clears the flag (so the gate closes again) and re-runs the challenge a few
 * times; after that it gives up and waits for the next page load.
 */
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

export function BotProtection() {
  const widgetRef = useRef<TurnstileInstance | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRetry = useCallback(() => {
    if (retriesRef.current >= MAX_RETRIES) return;

    retriesRef.current += 1;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // Under the default `execution: "render"` a reset re-runs the challenge.
      widgetRef.current?.reset();
    }, RETRY_DELAY_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  // No site key configured (CI, a preview, a fresh checkout) → nothing to render,
  // and `isBotProtectionSatisfied()` reports the gate as open.
  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <Turnstile
      ref={widgetRef}
      siteKey={TURNSTILE_SITE_KEY}
      options={{ size: "invisible", retry: "never", refreshExpired: "never" }}
      onSuccess={(token) => {
        retriesRef.current = 0;
        setTurnstileToken(token);
        markTurnstileVerified();
      }}
      onError={() => {
        clearTurnstileToken();
        clearTurnstileVerification();
        scheduleRetry();
      }}
      onExpire={() => {
        clearTurnstileToken();
        clearTurnstileVerification();
        scheduleRetry();
      }}
    />
  );
}
