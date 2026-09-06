"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import {
  createImageKitLoader,
  isImageKitUrl,
  type ImageKitImagePreset,
} from "@/lib/imagekit-delivery";

interface ProductImageProps {
  src: string;
  alt: string;
  fallbackId?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  deliveryPreset?: ImageKitImagePreset;
  deliveryWidth?: number;
  quality?: number;
  priority?: boolean;
  loading?: "eager" | "lazy";
}

const IMAGEKIT_LOADERS: Record<ImageKitImagePreset, ReturnType<typeof createImageKitLoader>> = {
  thumbnail: createImageKitLoader({ preset: "thumbnail" }),
  small: createImageKitLoader({ preset: "small" }),
  productCard: createImageKitLoader({ preset: "productCard" }),
  pdpMain: createImageKitLoader({ preset: "pdpMain" }),
  pdpLarge: createImageKitLoader({ preset: "pdpLarge" }),
};

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
  deliveryPreset,
  deliveryWidth,
  quality,
  priority,
  loading,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const imageKitSource = isImageKitUrl(src);
  const imageKitLoader =
    imageKitSource && deliveryWidth
      ? createImageKitLoader({ maxWidth: deliveryWidth, quality })
      : imageKitSource && deliveryPreset
        ? IMAGEKIT_LOADERS[deliveryPreset]
        : undefined;

  if (failed || !src) {
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
    return (
      <Image
        alt={alt}
        className={className}
        sizes={sizes}
        onError={() => setFailed(true)}
        src={src}
        fill
        loader={imageKitLoader}
        priority={priority}
        loading={loading}
      />
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      sizes={sizes}
      onError={() => setFailed(true)}
      src={src}
      width={width ?? 200}
      height={height ?? 200}
      loader={imageKitLoader}
      priority={priority}
      loading={loading}
    />
  );
}
