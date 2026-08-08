import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/common/policy-layout";

export const metadata: Metadata = {
  title: "Delivery Policy",
  description:
    "Mioralane delivery policy — zones, timelines, fees and Cash on Delivery.",
};

export default function DeliveryPage() {
  return (
    <PolicyLayout
      title="Delivery Policy"
      intro="Fast, reliable delivery across Bangladesh — with Cash on Delivery available nationwide."
    >
      <PolicySection title="Delivery zones & timelines">
        <ul className="list-disc space-y-1 pl-5">
          <li>Inside Dhaka: 1–2 business days</li>
          <li>Outside Dhaka: 2–4 business days</li>
          <li>Remote areas: up to 5 business days</li>
        </ul>
      </PolicySection>

      <PolicySection title="Delivery fees">
        <ul className="list-disc space-y-1 pl-5">
          <li>Free delivery on all orders over ৳2,000 within Dhaka</li>
          <li>Smaller Dhaka orders: ৳60 delivery fee</li>
          <li>Outside Dhaka: ৳80–৳130 depending on area</li>
        </ul>
      </PolicySection>

      <PolicySection title="Cash on Delivery">
        <p>
          Cash on Delivery (COD) is available nationwide. Please keep the exact
          amount ready, or pay via bKash, Nagad or Rocket to our delivery
          partner upon arrival.
        </p>
      </PolicySection>

      <PolicySection title="Tracking">
        <p>
          Once your order ships, you&apos;ll receive a tracking link via SMS and
          WhatsApp. You can also use our{" "}
          <a href="/track-order" className="text-accent underline">
            Track Order
          </a>{" "}
          page with your order ID.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
