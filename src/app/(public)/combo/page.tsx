import type { Metadata } from "next";
import Link from "next/link";
import { ComboSection } from "@/components/common/combo-section";
import { Reveal } from "@/components/common/reveal";

export const metadata: Metadata = {
    title: "Routines & Bundles - Mioralane",
    description:
        "Complete Korean skincare routines curated by Mioralane. Save money on bundles, kits, and full routines.",
};

export default function ComboPage() {
    return (
        <>
            {/* ── Hero ── */}
            <section className="bg-brand-50 py-8 md:py-16">
                <div className="container mx-auto px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-dark">
                        <span className="inline-block animate-twinkle">✦</span>
                        Curated Bundles
                    </span>
                    <h1 className="mx-auto mt-5 max-w-2xl font-serif text-3xl font-bold tracking-tight text-ink md:text-5xl">
                        Routines &amp; Bundles
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base text-ink/60 md:text-lg">
                        Curated K-beauty routines, thoughtfully paired — save time and
                        money.
                    </p>
                    <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base font-semibold tracking-wide text-ink/80">
                        Curated in-house · One bundle · One price
                    </p>
                </div>
            </section>

            {/* ── Bundles ── */}
            <section className="bg-surface py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <Reveal>
                        <ComboSection />
                    </Reveal>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="bg-surface pb-16 md:pb-20">
                <div className="container mx-auto px-4">
                    <Reveal>
                        <div className="rounded-3xl bg-brand-50 px-6 py-12 text-center md:py-16">
                            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink md:text-4xl">
                                Not sure where to start?
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60 md:text-base">
                                Browse our full range of Korean skincare essentials and build
                                your own routine.
                            </p>
                            <Link
                                href="/shop"
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
                            >
                                Explore the shop →
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
