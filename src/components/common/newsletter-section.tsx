"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";

export function NewsletterSection() {
  return (
    <section className="bg-gradient-to-r from-rose-50 to-rose-100/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center">
          <SectionHeading title="JOIN THE GLOW CLUB" />
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-8 flex max-w-md gap-2"
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
      </div>
    </section>
  );
}
