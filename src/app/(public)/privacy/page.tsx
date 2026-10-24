import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/common/policy-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Mioralane collects, uses and protects your personal information — including the third-party services we rely on.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      intro="Your privacy matters. This policy explains what we collect, how we use it, and the choices and rights you have."
    >
      <PolicySection title="Information We Collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-ink/70">Account information</strong> — the
            username and email address you provide when you create an account,
            plus your name and profile picture if you choose to sign in with
            Google.
          </li>
          <li>
            <strong className="text-ink/70">Order and delivery information</strong>{" "}
            — the products you order and the shipping details you give us, such
            as your name, phone number and delivery address.
          </li>
          <li>
            <strong className="text-ink/70">Content you submit</strong> — product
            reviews and ratings you choose to post.
          </li>
          <li>
            <strong className="text-ink/70">Technical information</strong> — your
            IP address, device and browser characteristics, and the pages you
            visit on our store.
          </li>
          <li>
            <strong className="text-ink/70">Bot-protection signals</strong> — the
            limited technical information described under{" "}
            <em>Third-Party Services</em> below.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="How We Use Your Information">
        <ul className="list-disc space-y-1 pl-5">
          <li>Process, pack and deliver your orders and keep you updated on them.</li>
          <li>Create and secure your account, and let you sign in.</li>
          <li>Publish the reviews and ratings you submit.</li>
          <li>
            Protect our store and our customers from fraud, spam, abuse and
            automated attacks.
          </li>
          <li>Improve our products, website and customer service.</li>
          <li>Meet our legal and accounting obligations.</li>
        </ul>
        <p>
          We do not sell your personal information, and we only use it for the
          purposes described in this policy.
        </p>
      </PolicySection>

      <PolicySection title="Third-Party Services">
        <p>
          We rely on a small number of trusted service providers to run the
          store. They process limited information only as needed to provide
          their service to us.
        </p>

        <h3 className="pt-1 font-serif text-base font-medium text-ink">
          Cloudflare Turnstile
        </h3>
        <p>
          This website uses Cloudflare Turnstile to help distinguish human
          visitors from automated bots. Turnstile works in the background and may
          collect limited technical information — such as browser characteristics,
          IP address, and interaction signals — solely to verify that the request
          is legitimate.
        </p>
        <p>
          For details on what Cloudflare collects and how it is handled, see the
          Cloudflare Turnstile Privacy Addendum:{" "}
          <a
            href="https://www.cloudflare.com/turnstile-privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            https://www.cloudflare.com/turnstile-privacy-policy/
          </a>
        </p>

        <h3 className="pt-1 font-serif text-base font-medium text-ink">
          ImageKit
        </h3>
        <p>
          Product imagery is delivered through ImageKit, which processes the
          images we upload on our behalf.
        </p>

        <h3 className="pt-1 font-serif text-base font-medium text-ink">
          Google Sign-In
        </h3>
        <p>
          Google Sign-In is optional. If you choose it, Google shares a limited
          profile (such as your email and profile picture) with us so we can
          create or match your account.
        </p>

        <p className="pt-1">You can read each provider&apos;s own policy here:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              Cloudflare Privacy Policy
            </a>{" "}
            and the{" "}
            <a
              href="https://www.cloudflare.com/turnstile-privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              Turnstile Privacy Addendum
            </a>
          </li>
          <li>
            <a
              href="https://imagekit.io/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              ImageKit Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              Google Privacy Policy
            </a>
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Data Retention">
        <p>
          We keep your account and order information for as long as your account
          is active and as long as we need it to provide our services, resolve
          disputes and meet legal, tax and accounting requirements. When you ask
          us to delete your account, we remove or anonymise your personal
          information as soon as we reasonably can, except where we are required
          to keep it by law.
        </p>
      </PolicySection>

      <PolicySection title="Your Rights">
        <p>
          You can ask us to access, correct or delete the personal information we
          hold about you, and to object to or restrict certain processing. To
          make a request, contact us using the details below. We will respond
          within a reasonable timeframe and may need to verify your identity
          first.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          If you have any questions about this policy or how we handle your
          personal information, please reach out through our{" "}
          <a href="/contact" className="text-accent underline">
            contact page
          </a>{" "}
          or email{" "}
          <a
            href="mailto:support@mioralane.com"
            className="text-accent underline"
          >
            support@mioralane.com
          </a>
          .
        </p>
      </PolicySection>

      <p className="mt-10 text-sm text-ink/40">
        This policy may be updated from time to time. The latest version always
        lives on this page.
      </p>
    </PolicyLayout>
  );
}
