/**
 * The FAQ content, in one place.
 *
 * It was previously declared inside `app/(public)/faq/page.tsx`, which meant the
 * `FAQPage` structured data had to re-read the same array from the page. Keeping
 * the list here lets the rendered accordion and `generateFaqJsonLd` share one
 * source, so they can never disagree — Google requires the marked-up questions to
 * be visible on the page.
 *
 * No imports, so `scripts/verify-seo.ts` can load it under Node's type stripping.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQS: FaqEntry[] = [
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
    answer: "Yes, Cash on Delivery is available nationwide at checkout.",
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
