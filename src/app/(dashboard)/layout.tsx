import type { Metadata } from "next";

/**
 * The account area (orders, addresses, profile, reviews, wishlist) is behind
 * authentication and is entirely per-customer. A crawler only ever reaches the
 * signed-out shell, which it must not index.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
