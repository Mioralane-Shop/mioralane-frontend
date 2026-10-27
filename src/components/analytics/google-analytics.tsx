"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID, GA_SCRIPT_SRC } from "@/constants/analytics";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

/**
 * The last path reported to GA.
 *
 * Module scope rather than a ref on purpose: React's development StrictMode
 * mounts effects twice, and a per-instance ref would send the same `page_view`
 * twice. Remounting the tracker (a layout re-render, a cache change) must not
 * produce a second hit for a page that has not changed.
 */
let lastReportedPath: string | null = null;

/**
 * Sends one `page_view` per URL, including the first render.
 *
 * gtag is configured with `send_page_view: false`, so this effect is the only
 * source of page views — the initial load and every client-side navigation are
 * counted exactly once. `useSearchParams` makes query-string changes
 * (`/shop?tab=new`) count as new pages; it is wrapped in Suspense by the caller
 * because it forces this subtree to render on the client.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams?.toString() ?? "";
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (lastReportedPath === pagePath) return;
    lastReportedPath = pagePath;

    window.gtag?.("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
    });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Loads the Google tag after the page is interactive.
 *
 * `afterInteractive` (Next's recommended strategy for analytics) keeps the
 * loader off the critical path and out of the prerendered HTML, so it cannot
 * delay first paint, and it runs once per document.
 *
 * No Google Tag Manager: this is the standalone gtag.js snippet only.
 */
export function GoogleAnalytics() {
  return (
    <>
      <Script id="ga4-gtag" src={GA_SCRIPT_SRC} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config','${GA_MEASUREMENT_ID}',{send_page_view:false});`}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
