"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-rose-50">
        <Image
          src={images[selected]}
          alt={`${name} - Image ${selected + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={cn(
                "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-rose-50 transition-all",
                selected === index
                  ? "border-rose-400 ring-2 ring-rose-200"
                  : "border-transparent hover:border-rose-200"
              )}
            >
              <Image
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
