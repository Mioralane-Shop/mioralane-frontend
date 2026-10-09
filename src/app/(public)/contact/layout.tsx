import type { Metadata } from "next";

/**
 * `/contact` is a `"use client"` page (it holds form state), and Next forbids
 * exporting metadata from a client component. A route-segment layout may export
 * it and receives the same URL, so the canonical and title live here — same
 * pattern as `/shop`, `/cart` and `/checkout`.
 */
export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Mioralane — order help, delivery questions and skincare advice over WhatsApp or email, for customers across Bangladesh.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
