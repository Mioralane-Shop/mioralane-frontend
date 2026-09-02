import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/common/section-heading";

const CARDS = [
  {
    title: "SKINCARE QUIZ",
    cta: "Take the Quiz",
    href: "/skincare-quiz",
    image: "/images/ig-kbeauty.jpg",
  },
  {
    title: "Build Your Routine",
    cta: "Explore Routines",
    href: "/blog/korean-skincare-routine-humid-climate",
    image: "/images/promo-routine.jpg",
  },
  {
    title: "Why K-Beauty?",
    cta: "Learn More",
    href: "/about",
    image: "/images/ig-flatlay.jpg",
  },
];

export function NewToKBeautySection() {
  return (
    <section className="home-section bg-surface">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="NEW TO KOREAN SKINCARE?"
          titleClassName="text-[22px] md:text-[25px] lg:text-[29px]"
        />

        <div className="home-section-content mx-auto grid max-w-[1200px] gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-ink/15 hover:shadow"
            >
              <div className="relative h-46 overflow-hidden bg-surface-soft md:h-48">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="flex flex-1 flex-col p-4 md:p-[18px]">
                <h3 className="min-h-[48px] text-lg font-bold uppercase tracking-tight text-ink">
                  {card.title}
                </h3>
                <span className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 group-hover:bg-accent md:mt-auto">
                  {card.cta}
                  {/* <ArrowRight className="h-4 w-4 shrink-0" /> */}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
