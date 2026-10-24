import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/common/policy-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of the Mioralane store, your orders and your account.",
};

export default function TermsOfServicePage() {
  return (
    <PolicyLayout
      title="Terms of Service"
      intro="These terms govern your use of the Mioralane store. By browsing or ordering from us, you agree to them."
    >
      <PolicySection title="Using Our Store">
        <p>
          You may browse the store freely. To place an order or manage a
          wishlist you need an account, and you are responsible for keeping your
          login details secure and for the accuracy of the information you give
          us — especially your delivery address and phone number.
        </p>
      </PolicySection>

      <PolicySection title="Orders and Payment">
        <p>
          Placing an order is an offer to buy. We confirm it when we accept the
          order, and we may decline or cancel one if an item is out of stock, a
          price was listed in error, or we suspect fraud. Payment is collected
          by Cash on Delivery; please have the exact amount ready for the
          delivery partner.
        </p>
      </PolicySection>

      <PolicySection title="Pricing and Availability">
        <p>
          Prices are shown in Bangladeshi Taka and include applicable taxes
          unless stated otherwise. Delivery charges are calculated at checkout
          and depend on your delivery zone. Stock is limited and shown on each
          product page.
        </p>
      </PolicySection>

      <PolicySection title="Shipping and Delivery">
        <p>
          Delivery timelines and charges are set out in our{" "}
          <a href="/delivery" className="text-accent underline">
            Delivery Policy
          </a>
          . Timelines are estimates, not guarantees — remote areas and public
          holidays can add a day or two.
        </p>
      </PolicySection>

      <PolicySection title="Returns and Refunds">
        <p>
          If something arrives damaged, incorrect or unopened and unwanted,
          please see our{" "}
          <a href="/returns" className="text-accent underline">
            Return &amp; Refund Policy
          </a>{" "}
          for what qualifies and how to start a return. For hygiene reasons,
          opened skincare generally cannot be returned.
        </p>
      </PolicySection>

      <PolicySection title="Product Information">
        <p>
          We describe products as accurately as we can, but packaging,
          ingredients and formulations can change between batches. Our content
          is for general information and is not medical advice — if you have a
          skin condition or allergy, check the product label and consult a
          professional.
        </p>
      </PolicySection>

      <PolicySection title="Intellectual Property">
        <p>
          The Mioralane name, logo and the content of this store belong to us or
          our licensors. Brand names and product imagery belong to their
          respective owners and are used to identify the goods we sell.
        </p>
      </PolicySection>

      <PolicySection title="Limitation of Liability">
        <p>
          We are responsible for delivering your order as described. To the
          extent the law allows, we are not liable for indirect losses, and our
          liability for any order is limited to the amount you paid for it.
        </p>
      </PolicySection>

      <PolicySection title="Changes to These Terms">
        <p>
          We may update these terms from time to time. The version published on
          this page applies to any order you place after it goes live, and we
          will flag material changes here.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          Questions about these terms? Reach us through our{" "}
          <a href="/contact" className="text-accent underline">
            contact page
          </a>
          . See also our{" "}
          <a href="/privacy" className="text-accent underline">
            Privacy Policy
          </a>
          .
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
