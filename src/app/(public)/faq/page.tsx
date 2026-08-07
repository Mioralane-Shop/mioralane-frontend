import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion, type FaqItem } from "@/components/common/faq-accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Mioralane — ordering, delivery, authenticity, returns and more.",
};

const FAQS: FaqItem[] = [
  {
    question: "Are your products 100% authentic?",
    answer:
      "Yes. Every product is batch-verified and sourced directly from authorized retailers in Seoul such as Olive Young and Stylevana. We check batch codes and packaging on arrival before it ships to you.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Within Dhaka, delivery takes 1–2 business days. Outside Dhaka, it typically takes 2–4 business days via courier. You'll receive a tracking link once your order ships.",
  },
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer:
      "Yes, Cash on Delivery is available nationwide. We also accept bKash, Nagad, Rocket and card payments through SSLCommerz at checkout.",
  },
  {
    question: "What is your return policy?",
    answer:
      "You can return items within 7 days of delivery if they are unopened and in original packaging. If your item arrives damaged or incorrect, we'll replace it or refund you — just contact us with photos.",
  },
  {
    question: "Is delivery free?",
    answer:
      "Delivery is free on all orders over ৳2,000 within Dhaka. A small delivery fee applies to smaller orders and to areas outside Dhaka.",
  },
  {
    question: "How do I know which products suit my skin type?",
    answer:
      "Each product page lists the recommended skin type and key concerns. You can also filter the shop by skin type and concern, or message us on WhatsApp and our team will help you build a routine.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-serif font-medium text-ink">
        Frequently Asked Questions
      </h1>
      <p className="mt-3 text-ink/50">
        Everything you need to know about shopping with Mioralane.
      </p>

      <div className="mt-10">
        <FaqAccordion items={FAQS} />
      </div>

      <div className="mt-12 rounded-2xl bg-surface p-8 text-center">
        <h2 className="text-lg font-serif font-medium text-ink">
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
