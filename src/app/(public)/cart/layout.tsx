import type { Metadata } from "next";

/**
 * The cart is a private, per-visitor view with nothing to rank for. Left alone it
 * would be served the root layout's `index, follow`, so it is explicitly opted
 * out of the index — `follow: true` keeps any links in the shell crawlable.
 */
export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
