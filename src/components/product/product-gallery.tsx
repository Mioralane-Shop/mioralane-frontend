"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createImageKitLoader, isImageKitUrl } from "@/lib/imagekit-delivery";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const PDP_MAIN_IMAGEKIT_LOADER = createImageKitLoader({ preset: "pdpMain" });
const THUMBNAIL_IMAGEKIT_LOADER = createImageKitLoader({ preset: "thumbnail" });

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-50">
        <Image
          src={images[selected]}
          alt={`${name} - Image ${selected + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          loader={isImageKitUrl(images[selected]) ? PDP_MAIN_IMAGEKIT_LOADER : undefined}
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={cn(
                "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-brand-50 transition-all",
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
