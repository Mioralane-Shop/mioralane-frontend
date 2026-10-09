import type { Metadata } from "next";

/**
 * Sign-in and registration are form pages with no search value, and an indexed
 * login page is a phishing-adjacent surface. Excluded from the index site-wide
 * for this route group.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
