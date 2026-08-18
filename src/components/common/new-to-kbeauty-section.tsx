import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/common/section-heading";

const CARDS = [
  {
    title: "SKINCARE QUIZ",
    cta: "TAKE QUIZ",
    href: "/skincare-quiz",
    image: "/images/ig-kbeauty.jpg",
    solid: false,
  },
  {
    title: "ABOUT US",
    cta: "LEARN MORE",
    href: "/about",
    image: null,
    solid: true,
  },
  {
    title: "WHY KOREAN SKINCARE",
    cta: "READ NOW",
    href: "/blog/korean-skincare-routine-humid-climate",
    image: "/images/blog-routine.jpg",
    solid: false,
  },
];

export function NewToKBeautySection() {
  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeading title="NEW TO KOREAN SKINCARE?" />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {card.solid ? (
                <div className="relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-[#FBDDE2] to-[#F5B8C4]">
                  <span className="px-6 text-center font-serif text-2xl font-medium text-[#B84E64]">
                    {card.title}
                  </span>
                </div>
              ) : (
                card.image && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )
              )}

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-bold uppercase tracking-tight text-ink">
                  {card.title}
                </h3>
                <span className="mt-5 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors group-hover:bg-accent">
                  {card.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
