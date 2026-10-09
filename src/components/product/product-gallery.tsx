"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { createImageKitLoader, isImageKitUrl } from "@/lib/imagekit-delivery";
import { isRenderableImageSrc } from "@/lib/safe-image-src";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const PDP_MAIN_IMAGEKIT_LOADER = createImageKitLoader({ preset: "pdpMain" });
const THUMBNAIL_IMAGEKIT_LOADER = createImageKitLoader({ preset: "thumbnail" });

export function ProductGallery({ images, name }: ProductGalleryProps) {
  // `images` are stored URLs. next/image's default loader throws for a host that
  // is not in `images.remotePatterns`, so anything unusable is dropped here and
  // falls through to the placeholder below. See `lib/safe-image-src.ts`.
  const renderable = images.filter(isRenderableImageSrc);
  const [selected, setSelected] = useState(0);

  if (renderable.length === 0) {
    return (
      <div
        role="img"
        aria-label={name}
        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-ink/[0.04] text-ink-muted/40"
      >
        <ImageOff className="h-8 w-8" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-50">
        <Image
          src={renderable[selected]}
          alt={`${name} - Image ${selected + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          loader={isImageKitUrl(renderable[selected]) ? PDP_MAIN_IMAGEKIT_LOADER : undefined}
        />
      </div>

      {renderable.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {renderable.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={cn(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-brand-50 transition-all",
                selected === index
                  ? "border-brand-400 ring-2 ring-brand-200"
                  : "border-transparent hover:border-brand-200"
              )}
            >
              <Image
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                loader={isImageKitUrl(image) ? THUMBNAIL_IMAGEKIT_LOADER : undefined}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
