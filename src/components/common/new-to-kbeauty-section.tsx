import Link from "next/link";
import Image from "next/image";

const CARDS = [
  {
    title: "SKINCARE QUIZ",
    desc: "Not sure where to start? Answer a few quick questions and get product recommendations made for your skin.",
    cta: "TAKE QUIZ",
    href: "/skincare-quiz",
    image: "/images/ig-kbeauty.jpg",
    solid: false,
  },
  {
    title: "ABOUT US",
    desc: "We bring authentic K-beauty to Bangladesh — batch-verified, sourced directly from Seoul.",
    cta: "LEARN MORE",
    href: "/about",
    image: null,
    solid: true,
  },
  {
    title: "WHY KOREAN SKINCARE",
    desc: "Discover why the Korean approach builds healthy, glowing skin that lasts — step by step.",
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
        {/* Heading with flanking lines */}
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-ink/20 sm:w-16" />
          <h2 className="text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
            New to Korean Skincare?
          </h2>
          <span className="h-px w-10 bg-ink/20 sm:w-16" />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {card.solid ? (
                /* Solid pink gradient card (About Us) */
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
                <p className="mt-2 flex-1 text-sm text-ink/50">{card.desc}</p>
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
