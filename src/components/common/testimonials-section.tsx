const TESTIMONIALS = [
  {
    stars: 5,
    text: "Finally, authentic Korean skincare in Dhaka! The COSRX snail mucin I received had a batch code that verified perfectly. The packaging was beautiful too — felt like a gift to myself.",
    name: "Sabrina Ahmed",
    location: "Dhanmondi, Dhaka",
    initial: "S",
    color: "#D4637A",
  },
  {
    stars: 5,
    text: "I've been buying Korean skincare from random Facebook sellers for years. Mioralane is the first place where I actually trust what I'm getting. The Beauty of Joseon sunscreen is my holy grail.",
    name: "Rima Chowdhury",
    location: "Gulshan, Dhaka",
    initial: "R",
    color: "#7C6B5D",
  },
  {
    stars: 5,
    text: "Ordered the Glass Skin bundle and it arrived in 2 days. The packaging was so pretty I almost didn't want to open it. Every product was sealed and brand new. Will definitely reorder.",
    name: "Nusrat Jahan",
    location: "Mirpur, Dhaka",
    initial: "N",
    color: "#2D5A3D",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold tracking-wider text-brand">
            Reviews
          </span>
          <h2 className="mt-2 text-3xl font-light tracking-tight text-ink">
            What our customers say
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="text-lg tracking-wider text-amber-400">
                {"★".repeat(t.stars)}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-ink/70">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: t.color }}
                >
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-medium text-ink">{t.name}</div>
                  <div className="text-xs text-ink/40">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
