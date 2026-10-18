import { BrandCard } from "@/components/brands/brand-card";
import type { Brand } from "@/types/brand";

/**
 * The brand index grid.
 *
 * Takes the list rather than fetching it, so the page stays the only component
 * that knows where the data comes from — this one renders whatever it is handed
 * and has no loading state to get wrong.
 *
 * The empty state is written out because it is reachable without a fault: on a
 * build with no API configured, `getBrands()` returns `[]` rather than throwing,
 * and "no cards at all" is a worse answer than a sentence saying so.
 */
export function BrandGrid({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) {
    return (
      <p className="rounded-2xl border border-border-light bg-white px-6 py-12 text-center text-sm text-ink/60">
        Our brand list is being updated. Please check back shortly.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {brands.map((brand) => (
        <li key={brand.id}>
          <BrandCard brand={brand} />
        </li>
      ))}
    </ul>
  );
}
