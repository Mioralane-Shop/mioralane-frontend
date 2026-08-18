"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, TrendingUp } from "lucide-react";
import { ProductImage } from "@/components/common/product-image";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";

const TRENDING = [
  "Snail Mucin",
  "Sunscreen",
  "Cleansing Oil",
  "Vitamin C",
  "Cica",
  "Sheet Mask",
];

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await productService.getAll({ search: q, limit: "8" });
        if (!cancelled) {
          setResults(res.products ?? []);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  if (!open) return null;

  const q = query.trim().toLowerCase();

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const nextQuery = query.trim();
    if (nextQuery) {
      router.push(`/shop?search=${encodeURIComponent(nextQuery)}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-white animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="border-b border-ink/10">
        <form
          onSubmit={submit}
          className="mx-auto flex w-full max-w-3xl items-center gap-3 px-6 py-5"
        >
          <Search className="h-5 w-5 flex-shrink-0 text-ink/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="flex-1 bg-transparent text-lg text-ink placeholder:text-ink/30 outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-ink/40 transition-colors hover:text-ink"
            aria-label="Close search"
          >
            <X className="h-6 w-6" />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          {q.length < 2 ? (
            <div>
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                <TrendingUp className="h-3.5 w-3.5" /> Trending Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink/70 transition-colors hover:border-accent hover:text-accent"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <p className="py-12 text-center text-ink/40">Searching...</p>
          ) : results.length === 0 ? (
            <p className="py-12 text-center text-ink/40">
              No products found for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <div className="space-y-1">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-ink/[0.04]"
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-ink/[0.04]">
                    <ProductImage
                      src={p.images[0]}
                      alt={p.name}
                      fallbackId={p.id}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {p.name}
                    </p>
                    <p className="text-xs text-ink/50">
                      {p.brand} · ৳{p.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
              <button
                onClick={() => submit()}
                className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-accent transition-colors hover:bg-ink/[0.04]"
              >
                See all results for &ldquo;{query}&rdquo; →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
