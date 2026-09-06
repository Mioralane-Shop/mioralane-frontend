"use client";

import Link from "next/link";
import { MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_WHATSAPP } from "@/constants/site";
import { useAuthStore } from "@/store/auth.store";

export default function TrackOrderPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-sm sm:p-10">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Support
        </span>
        <h1 className="mt-3 text-3xl font-serif font-medium text-ink sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-3 max-w-2xl text-ink/55">
          Live public tracking is not available yet. This page stays as the
          future tracking entry point, but it will not fabricate order status or
          accept arbitrary order-number lookups.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-ink">My Orders</p>
                <p className="text-sm text-ink/55">
                  Logged-in customers can review real order history and status.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild className="w-full rounded-full">
                <Link href="/orders">Go to My Orders</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-ink">Guest access</p>
                <p className="text-sm text-ink/55">
                  Sign in to view your own orders securely.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link
                  href={isAuthenticated ? "/orders" : "/login?redirect=%2Forders"}
                >
                  {isAuthenticated ? "View Orders" : "Sign In to View Orders"}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-500/15 bg-emerald-50/70 p-5">
          <p className="text-sm font-medium text-ink">
            Need help finding a recent order?
          </p>
          <p className="mt-2 text-sm text-ink/60">
            Use the authenticated order history in My Orders, or contact support
            on WhatsApp if you need help with a purchase you already placed.
          </p>
          <a
            href={`https://wa.me/${SITE_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-white px-5 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-ink/45">
            Future public tracking can be added here later without changing the
            link.
          </p>
          <Link href="/shop" className="font-medium text-accent hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
