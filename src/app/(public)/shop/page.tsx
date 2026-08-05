"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { CATEGORIES, SORT_OPTIONS, DUMMY_PRODUCTS } from "@/constants/site";

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  const { data: allProducts, isLoading } = useProducts();

  const products = allProducts || DUMMY_PRODUCTS;

  const filtered = products
    .filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-neutral-800">
          Shop All
        </h1>
        <p className="mt-2 text-neutral-400">
          Discover your perfect skincare routine
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-2xl border border-rose-100 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.slug ? null : cat.slug
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-rose-100 text-rose-700"
                      : "bg-neutral-50 text-neutral-600 hover:bg-rose-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 h-auto py-1 text-xs"
                onClick={() => setSelectedCategory(null)}
              >
                <X className="mr-1 h-3 w-3" />
                Clear filter
              </Button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          {!isLoading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-neutral-400">
                No products found matching your criteria.
              </p>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
