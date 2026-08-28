"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  fallbackId?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

/**
 * next/image wrapper that falls back to a working placeholder (picsum.photos)
 * when the source image fails to load or is an unreachable placeholder URL
 * (e.g. products seeded with "https://example.com/..." images).
 */
export function ProductImage({
  src,
  alt,
  fallbackId,
  fill,
  className,
  sizes,
  width,
  height,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  const effectiveSrc = failed
    ? `https://picsum.photos/seed/${fallbackId ?? "product"}/800/800`
    : src;

  if (fill) {
    return <Image alt={alt} className={className} sizes={sizes} onError={() => setFailed(true)} src={effectiveSrc} fill />;
  }

  return (
    <Image
      alt={alt}
      className={className}
      sizes={sizes}
      onError={() => setFailed(true)}
      src={effectiveSrc}
      width={width ?? 200}
      height={height ?? 200}
    />
  );
}
