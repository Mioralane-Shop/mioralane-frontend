import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/common/policy-layout";

export const metadata: Metadata = {
  title: "Authenticity Policy",
  description:
    "How Mioralane guarantees every product is 100% authentic Korean skincare.",
};

export default function AuthenticityPage() {
  return (
    <PolicyLayout
      title="Authenticity Policy"
      intro="Every product on Mioralane is 100% authentic Korean skincare. Here's exactly how we guarantee it."
    >
      <PolicySection title="Direct sourcing">
        <p>
          We purchase directly from authorized distributors, official brand
          stores and trusted retailers in Seoul — including Olive Young and
          Stylevana. We never buy from gray-market or unknown third parties.
        </p>
      </PolicySection>

      <PolicySection title="Batch verification">
        <p>
          Each product carries a verifiable batch code. Before it ships, we
          check the batch code and packaging against the brand&apos;s official
          records. You can scan or search your product&apos;s batch code on the
          brand&apos;s website to confirm it yourself.
        </p>
      </PolicySection>

      <PolicySection title="Packaging inspection">
        <p>
          We inspect the box, seals, fonts and texture of every unit on arrival.
          Differences in printing, seal quality or texture are red flags we take
          seriously — if anything doesn&apos;t match, we don&apos;t list it.
        </p>
      </PolicySection>

      <PolicySection title="Our promise">
        <p>
          If you ever receive a product you believe is not authentic, contact us
          within 7 days with photos. We will investigate, and if we can&apos;t
          verify it, we&apos;ll refund you in full — no questions asked.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
