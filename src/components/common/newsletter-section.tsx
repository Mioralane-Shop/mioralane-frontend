"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export function NewsletterSection() {
  return (
    <section className="bg-gradient-to-r from-rose-50 to-rose-100/50">
      <div className="container mx-auto px-4 py-16 text-center md:py-20">
        <h2 className="text-3xl font-light tracking-tight text-neutral-800">
          Join the Glow Club
        </h2>
        <p className="mx-auto mt-3 max-w-md text-neutral-500">
          Subscribe for exclusive offers, skincare tips, and early access to new
          launches.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-6 flex max-w-md gap-2"
        >
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="email"
              placeholder="Enter your email"
              className="pl-10"
            />
          </div>
          <Button type="submit">Subscribe</Button>
        </form>
        <p className="mt-3 text-xs text-neutral-400">
          No spam, unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
