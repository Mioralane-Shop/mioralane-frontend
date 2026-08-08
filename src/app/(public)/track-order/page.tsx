"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MessageCircle, PackageCheck } from "lucide-react";
import { SITE_WHATSAPP } from "@/constants/site";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "packed", label: "Packed & Verified" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [tracked, setTracked] = useState(false);

  const activeIndex = tracked ? 3 : 0;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <span className="text-xs font-bold uppercase tracking-widest text-accent">
        Support
      </span>
      <h1 className="mt-3 text-3xl font-serif font-medium text-ink">
        Track Your Order
      </h1>
      <p className="mt-3 text-ink/50">
        Enter your order ID (found in your confirmation email or SMS) to see the
        current status.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (orderId.trim()) setTracked(true);
        }}
        className="mt-8 flex gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. MRL-20260807-XXXX"
            className="w-full rounded-full border border-ink/15 py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
        >
          Track
        </button>
      </form>

      {tracked && (
        <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <PackageCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Order {orderId}</p>
              <p className="text-xs text-emerald-600">
                Delivered · Aug 7, 2026
              </p>
            </div>
          </div>

          <div className="space-y-0">
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      i <= activeIndex
                        ? "bg-ink text-white"
                        : "bg-ink/10 text-ink/40"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`w-px flex-1 ${
                        i < activeIndex ? "bg-ink/40" : "bg-ink/10"
                      }`}
                    />
                  )}
                </div>
                <div className="pb-8">
                  <p
                    className={`text-sm font-medium ${
                      i <= activeIndex ? "text-ink" : "text-ink/40"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 rounded-2xl bg-surface p-6 text-center">
        <p className="text-sm text-ink/60">
          Can&apos;t find your order? Message us on WhatsApp and our team will
          help you out.
        </p>
        <a
          href={`https://wa.me/${SITE_WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-6 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/shop"
          className="text-sm font-medium text-accent hover:underline"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}
