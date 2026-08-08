import Link from "next/link";
import { CATEGORIES } from "@/constants/site";

export function CategorySection() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-light tracking-tight text-neutral-800">
          Shop by Category
        </h2>
        <p className="mt-2 text-neutral-400">
          Find exactly what your skin needs
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-rose-50 p-4 text-center transition-all hover:bg-rose-100"
          >
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-105">
              <span className="text-2xl">
                {category.slug === "cleansers" && "🧴"}
                {category.slug === "serums" && "✨"}
                {category.slug === "moisturizers" && "💧"}
                {category.slug === "masks" && "🎭"}
                {category.slug === "sun-care" && "☀️"}
                {category.slug === "sets" && "🎁"}
              </span>
            </div>
            <h3 className="text-sm font-medium text-neutral-700">
              {category.name}
            </h3>
            <p className="mt-1 text-xs text-neutral-400">
              {category.productCount} products
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
