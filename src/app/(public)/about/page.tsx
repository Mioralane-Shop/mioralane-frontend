import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { WhyMioralane } from "@/components/common/why-mioralane";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About Mioralane — Bangladesh's trusted destination for authentic Korean skincare.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      {/* Hero */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          About Us
        </span>
        <h1 className="mt-3 text-4xl font-serif font-medium text-ink">
          Bringing authentic K-beauty to Bangladesh
        </h1>
        <p className="mt-4 text-ink/60 leading-relaxed">
          Mioralane started with a simple frustration: genuine Korean skincare
          was hard to find in Bangladesh, and when it was, you could never be
          sure it was the real thing. So we decided to change that.
        </p>
      </div>

      {/* Story */}
      <div className="mt-16 grid items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="/images/about-story.jpg"
            alt="Inside the Mioralane sourcing process"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-medium text-ink">
            Our story
          </h2>
          <p className="mt-4 text-ink/60 leading-relaxed">
            We source directly from authorized distributors in Seoul — brands
            like COSRX, Beauty of Joseon, ANUA and Purito — and ship everything
            to Dhaka in temperature-controlled batches. No middlemen, no gray
            market, no guesswork.
          </p>
          <p className="mt-4 text-ink/60 leading-relaxed">
            Every product is batch-verified before it reaches your door, and
            every order is packed with care. We&apos;re here to make
            high-quality K-beauty accessible, affordable and completely
            trustworthy for Bangladesh.
          </p>
        </div>
      </div>

      {/* Why Mioralane — Korean skincare you can trust */}
      <div className="mt-20">
        <WhyMioralane />
      </div>

      {/* CTA */}
      <div className="mt-20 rounded-3xl bg-surface p-10 text-center">
        <h2 className="text-2xl font-serif font-medium text-ink">
          Ready to start your glow-up?
        </h2>
        <p className="mt-3 text-ink/50">
          Explore our curated collection of authentic Korean skincare.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Shop Now
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
