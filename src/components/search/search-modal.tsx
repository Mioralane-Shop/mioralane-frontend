"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { ProductImage } from "@/components/common/product-image";
import { useProductSearch } from "@/hooks/use-product-search";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    data: results = [],
    isLoading,
    isError,
    isSettling,
    refetch,
  } = useProductSearch(query, { enabled: open, limit: 8 });

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
    setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim();

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
                    type="button"
                    onClick={() => setQuery(t)}
                    className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink/70 transition-colors hover:border-accent hover:text-accent"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : isLoading || isSettling ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-ink/40">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-ink">
                Couldn&apos;t load search results.
              </p>
              <p className="mt-1 text-sm text-ink/50">
                Please try again in a moment.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : results.length === 0 ? (
            <p className="py-12 text-center text-ink/40">
              No products found for &ldquo;{q}&rdquo;
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
                      deliveryPreset="thumbnail"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {p.name}
                    </p>
                    <p className="text-xs text-ink/50">
                      {p.brand} Â· à§³{p.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => submit()}
                className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-accent transition-colors hover:bg-ink/[0.04]"
              >
                See all results for &ldquo;{query}&rdquo; &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
