import type { AnnouncementBar } from "@/types/announcement";

/**
 * The published announcement campaign, read on the server so it is already in the
 * HTML.
 *
 * Without this the bar rendered its built-in `FALLBACK` first and swapped to the
 * real campaign once the browser's request resolved — a visible flash of a bar that
 * was never live, on every single page load. Measured before the fix: the
 * server-rendered document contained the green "Free delivery…" fallback and did not
 * contain the published "coming soon" campaign at all, so the wrong bar was what
 * arrived first.
 *
 * Best-effort, like the brand index's fetch: a page render must never depend on a
 * reachable API, and `next build` must not either. `null` means "we could not find
 * out", which is different from "there is no campaign" and is left to the caller.
 *
 * ## Why a minute, and not an hour or `no-store`
 *
 * This fetch sits in the ROOT layout, so whatever it declares applies to every route
 * that renders through it. An hour would bake a stale campaign into otherwise-static
 * pages; `no-store` would make every page dynamic. A minute is short enough that an
 * admin's edit appears almost at once — the client query revalidates on load anyway,
 * and only ever overrides this value — and long enough that pages stay cacheable.
 *
 * A second server caller does not exist yet. If one appears, it should import this
 * rather than repeat the fetch.
 */

/** Abort after this long; a layout render must never hang on the API. */
const FETCH_TIMEOUT_MS = 4000;

/** How long a successful read stays warm. */
const REVALIDATE_SECONDS = 60;

type NextFetchInit = RequestInit & { next?: { revalidate?: number } };

/** Read lazily: a build with no env configured is still a successful build. */
function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
}

/**
 * Shape check on the way in. This value is rendered into the root layout of every
 * page, so something unexpected from a proxy or an older deployment must be dropped
 * rather than allowed to throw during a layout render.
 */
function isAnnouncement(value: unknown): value is AnnouncementBar {
  const candidate = value as Partial<AnnouncementBar> | null | undefined;

  return (
    !!candidate &&
    typeof candidate === "object" &&
    typeof candidate.enabled === "boolean" &&
    Array.isArray(candidate.messages) &&
    candidate.messages.every(
      (message) => !!message && typeof (message as { text?: unknown }).text === "string",
    )
  );
}

/** The published campaign, or `null` if it could not be determined. Never throws. */
export async function getAnnouncement(): Promise<AnnouncementBar | null> {
  const base = apiBase();

  if (!base) {
    return null;
  }

  try {
    const response = await fetch(`${base}/announcements`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    } as NextFetchInit);

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { announcement?: unknown };

    return isAnnouncement(payload.announcement) ? payload.announcement : null;
  } catch {
    return null;
  }
}
