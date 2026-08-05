import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-100/50">
      <div className="container mx-auto grid min-h-[600px] items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-0">
        <div className="flex flex-col gap-6">
          <span className="text-sm font-medium uppercase tracking-widest text-rose-400">
            Premium Korean Skincare
          </span>
          <h1 className="text-4xl font-light leading-tight tracking-tight text-neutral-800 md:text-5xl lg:text-6xl">
            Reveal Your
            <br />
            <span className="font-normal text-rose-500">Natural Radiance</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-neutral-500">
            Discover our curated collection of luxury Korean skincare products,
            formulated with the finest ingredients for healthy, glowing skin.
          </p>
          <div className="flex gap-3">
            <Link href="/shop">
              <Button size="lg">Shop Now</Button>
            </Link>
            <Link href="/shop?sort=newest">
              <Button variant="outline" size="lg">
                New Arrivals
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <Image
              src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop"
              alt="Skincare products"
              fill
              className="rounded-3xl object-cover shadow-2xl"
              priority
            />
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Best Seller
              </p>
              <p className="text-sm font-medium text-neutral-700">
                Radiance Glow Serum
              </p>
              <p className="text-lg font-semibold text-rose-500">$48.00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
