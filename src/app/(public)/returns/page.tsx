import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/common/policy-layout";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "Mioralane return and refund policy — simple, fair and fast.",
};

export default function ReturnsPage() {
  return (
    <PolicyLayout
      title="Return & Refund Policy"
      intro="We want you to love what you ordered. If something isn't right, here's how returns work."
    >
      <PolicySection title="Return window">
        <p>
          You can return items within 7 days of delivery. Products must be
          unopened, unused and in their original packaging.
        </p>
      </PolicySection>

      <PolicySection title="Damaged or incorrect orders">
        <p>
          If your item arrives damaged, defective or is not what you ordered,
          contact us within 48 hours of delivery with photos of the product and
          packaging. We&apos;ll replace it or issue a full refund.
        </p>
      </PolicySection>

      <PolicySection title="How to start a return">
        <ul className="list-disc space-y-1 pl-5">
          <li>Contact us on WhatsApp or email with your order ID</li>
          <li>Share a photo and reason for the return</li>
          <li>We&apos;ll arrange a pickup or give you a return address</li>
          <li>
            Once received and checked, refunds are processed within 2–3 days
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Refunds">
        <p>
          Refunds are issued to your original payment method. For Cash on
          Delivery orders, refunds are paid via bKash, Nagad or Rocket. Shipping
          fees are non-refundable unless the return is due to our error.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
