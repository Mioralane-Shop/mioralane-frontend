"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
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
 * next/image wrapper that shows a neutral placeholder when the source image
 * fails to load or is an unreachable placeholder URL.
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

  const effectiveSrc = src;

  if (failed) {
    return (
      <div
        aria-label={alt}
        role="img"
        data-fallback-id={fallbackId}
        className={`flex items-center justify-center overflow-hidden bg-ink/[0.04] text-ink-muted/40 ${className ?? ""}`}
        style={!fill ? { width: width ?? 200, height: height ?? 200 } : undefined}
      >
        <ImageOff className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  }

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
