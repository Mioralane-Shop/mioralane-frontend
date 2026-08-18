import { SectionHeading } from "@/components/common/section-heading";

const TESTIMONIALS = [
  {
    stars: 5,
    name: "Sabrina Ahmed",
    location: "Dhanmondi, Dhaka",
    initial: "S",
    color: "#D4637A",
  },
  {
    stars: 5,
    name: "Rima Chowdhury",
    location: "Gulshan, Dhaka",
    initial: "R",
    color: "#7C6B5D",
  },
  {
    stars: 5,
    name: "Nusrat Jahan",
    location: "Mirpur, Dhaka",
    initial: "N",
    color: "#2D5A3D",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <SectionHeading title="CUSTOMER REVIEWS" />
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
