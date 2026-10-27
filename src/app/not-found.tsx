import Link from "next/link";

/**
 * The 404 page for the whole app.
 *
 * It exists because `/product/[slug]` calls `notFound()` for a deleted product:
 * Next answers with the nearest `not-found` boundary, and without this file that
 * would be the framework's bare default. The status is what search engines read;
 * the copy is what a shopper sees, so it offers the two routes that recover them.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start px-5 py-24 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
        404
      </p>
      <h1 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink/60">
        The page may have moved, or the product is no longer available. Everything
        currently in stock is in the shop.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          Continue shopping
        </Link>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
