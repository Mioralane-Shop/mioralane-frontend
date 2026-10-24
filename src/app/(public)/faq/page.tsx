import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/common/faq-accordion";
import { FAQS } from "@/constants/faq";
import { JsonLd } from "@/components/seo/json-ld";
import { generateFaqJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ",
  description:
    "Frequently asked questions about Mioralane — ordering, delivery, authenticity, returns and more.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* One list, two consumers: the accordion below and the FAQPage graph.
          Google requires the marked-up questions to be visible on the page. */}
      <JsonLd data={generateFaqJsonLd(FAQS)} />
      <h1 className="text-3xl font-display font-medium text-ink">
        Frequently Asked Questions
      </h1>
      <p className="mt-3 text-ink/50">
        Everything you need to know about shopping with Mioralane.
      </p>

      <div className="mt-10">
        <FaqAccordion items={FAQS} />
      </div>

      <div className="mt-12 rounded-2xl bg-surface p-8 text-center">
        <h2 className="text-lg font-display font-medium text-ink">
          Still have questions?
        </h2>
        <p className="mt-2 text-sm text-ink/50">
          Reach out to us and we&apos;ll get back to you as soon as possible.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Contact Us
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
