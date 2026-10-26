import type { Metadata } from "next";

/**
 * Checkout is a funnel step, not a landing page: it is thin, session-specific and
 * useless in a search result. Rendering it for a crawler is also the one page
 * where a stale cache is actively harmful, so it is kept out of the index.
 */
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
