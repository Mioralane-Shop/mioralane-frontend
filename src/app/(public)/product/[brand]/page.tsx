import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { lookupProductBySlug } from "@/lib/seo/data";
import { productPath } from "@/lib/product-path";
import { decodePathSegment } from "@/lib/utils";

/**
 * Legacy flat product URLs: `/product/<productSlug>` → `/product/<brandSlug>/<productSlug>`.
 *
 * These were every product link on the site before the nested structure, so they
 * are what Google has indexed. This segment is the server-side 301-equivalent:
 * look the slug up, resolve the brand, and redirect permanently — a missing
 * product still answers 404 rather than bouncing somewhere arbitrary.
 *
 * ## Why the dynamic segment is called `[brand]`
 *
 * Next.js refuses two *different* dynamic segment names at the same level
 * (`/product/[slug]` next to `/product/[brand]/[slug]` fails the build with
 * "You cannot use different slug names for the same dynamic path"). So this file
 * and the nested page share the name `[brand]` — and here the value is a **legacy
 * product slug**, not a brand. That is the only reason the name looks wrong.
 *
 * ## Why `permanentRedirect` (308) rather than a literal 301
 *
 * A React Server Component cannot set a status code; `permanentRedirect()` emits
 * **308 Permanent Redirect**, which is the method-preserving permanent redirect
 * and is treated by search engines exactly like a 301 for indexing and ranking.
 * A literal 301 would require a middleware hop that calls the API on every legacy
 * URL, for no SEO difference.
 *
 * `force-dynamic` keeps the build from trying to prerender a route whose only job
 * is a per-request database lookup.
 */
export const dynamic = "force-dynamic";

type LegacyParams = { brand: string };

export default async function LegacyProductRedirect({
  params,
}: {
  params: Promise<LegacyParams>;
}) {
  const legacySlug = decodePathSegment((await params).brand);
  const lookup = await lookupProductBySlug(legacySlug);

  // Only a definitive 404 answers 404. An outage must not de-index a URL that
  // still exists, so it renders a "try again" note instead.
  if (lookup.status === "missing") {
    notFound();
  }

  if (lookup.status === "unavailable") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-display text-ink">This product page has moved</h1>
        <p className="mt-3 text-sm leading-7 text-ink-soft">
          We could not confirm its new address just now. Please refresh in a moment, or
          browse the <Link href="/shop" className="underline underline-offset-4">shop</Link>.
        </p>
      </div>
    );
  }

  const canonical = productPath(lookup.product);

  // A product without a resolvable brand has no nested URL to send anyone to; the
  // flat page would redirect to itself forever.
  if (canonical === `/product/${legacySlug}`) {
    notFound();
  }

  permanentRedirect(canonical);
}
