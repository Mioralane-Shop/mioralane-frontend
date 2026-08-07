import type { ReactNode } from "react";

export function PolicyLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <span className="text-xs font-bold uppercase tracking-widest text-accent">
        Mioralane
      </span>
      <h1 className="mt-3 text-3xl font-serif font-medium text-ink">{title}</h1>
      <p className="mt-3 text-ink/50">{intro}</p>
      <div className="mt-10">{children}</div>
    </div>
  );
}

export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-serif font-medium text-ink">{title}</h2>
      <div className="space-y-3 text-ink/60 leading-relaxed">{children}</div>
    </section>
  );
}
