"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { useToastStore } from "@/store/toast.store";

type NavigationItemProps = {
  label: string;
  href?: string;
  comingSoon?: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

export function NavigationItem({
  label,
  href,
  comingSoon = false,
  onClick,
  className = "",
  children,
}: NavigationItemProps) {
  const addToast = useToastStore((state) => state.addToast);

  const handleComingSoonClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    addToast(`${label} is coming soon.`, "info");
    onClick?.();
  };

  if (comingSoon || !href) {
    return (
      <button
        type="button"
        onClick={handleComingSoonClick}
        className={className}
      >
        {children ?? label}
      </button>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children ?? label}
    </Link>
  );
}
