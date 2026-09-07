"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoVariant = "full" | "icon";

const SIZE_STYLES = {
  sm: {
    icon: "h-6 w-auto",
  },
  md: {
    icon: "h-8 w-auto",
  },
  lg: {
    icon: "h-10 w-auto",
  },
} as const;

type BrandLogoProps = {
  href?: string;
  size?: keyof typeof SIZE_STYLES;
  variant?: BrandLogoVariant;
  className?: string;
  label?: string;
  priority?: boolean;
};

export function BrandLogo({
  href = "/",
  size = "md",
  variant = "full",
  className,
  label = "Mioralane home",
  priority = false,
}: BrandLogoProps) {
  const styles = SIZE_STYLES[size];
  const src = variant === "icon" ? "/logo/logo_icon.svg" : "/logo/logo_text.svg";
  const dimensions =
    variant === "icon"
      ? { width: 692, height: 525 }
      : { width: 981, height: 245 };

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("inline-flex items-center no-underline", className)}
    >
      <Image
        src={src}
        alt=""
        width={dimensions.width}
        height={dimensions.height}
        aria-hidden="true"
        className={cn("shrink-0 object-contain", styles.icon)}
        priority={priority}
      />
    </Link>
  );
}
