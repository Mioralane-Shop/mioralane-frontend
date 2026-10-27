/**
 * Google Analytics 4 — the storefront's single measurement destination.
 *
 * The ID lives here, not inline in the component, so the tag itself and every
 * future event helper read the same property. There is exactly ONE tag: the
 * loader is mounted once from the root layout, `GoogleAnalytics` keys both
 * injected scripts on fixed DOM ids (Next dedupes on them), and gtag's automatic
 * `page_view` is disabled so the component can send exactly one per navigation.
 */
export const GA_MEASUREMENT_ID = "G-5C29W2DLFM";

/** The official gtag.js loader for that property (the only GA script tag). */
export const GA_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
