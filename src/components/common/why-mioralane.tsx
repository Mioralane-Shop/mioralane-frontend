"use client";

const TRUST_PILLARS = [
  {
    icon: "🇰🇷",
    title: "Directly Sourced",
    desc: "We work directly with brands and authorized distributors in Seoul — no middlemen, no gray market.",
  },
  {
    icon: "🔬",
    title: "Batch Verified",
    desc: "Every product has a verifiable batch code. Scan it on the brand's official site to confirm authenticity.",
  },
  {
    icon: "🚚",
    title: "Fast BD Delivery",
    desc: "Free delivery over ৳999 in Dhaka (2 days). Outside Dhaka: ৳80/৳130, 3-5 days. COD available.",
  },
  {
    icon: "💧",
    title: "Gentle for Humid Skin",
    desc: "Curated for Bangladesh's climate — lightweight, non-greasy formulas that work in 90% humidity.",
  },
];

export function WhyMioralane() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold tracking-wider text-brand">
            Why Mioralane
          </span>
          <h2 className="mt-2 text-3xl font-light tracking-tight text-ink">
            Korean skincare you can trust
          </h2>
          <p className="mt-3 mx-auto max-w-2xl text-ink/50">
            We bring authentic K-beauty to Bangladesh with transparency, speed,
            and care.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {TRUST_PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="flex flex-col items-center text-center gap-4 rounded-2xl border border-border-light bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-2xl">
                {pillar.icon}
              </div>
              <h3 className="text-lg font-semibold text-ink">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-ink/50">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
