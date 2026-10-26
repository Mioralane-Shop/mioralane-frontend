"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { useToastStore } from "@/store/toast.store";

type NavigationItemProps = {
  label: string;
  href?: string;
  comingSoon?: boolean;
  /**
   * Marks this item as the section the visitor is in. Only supplies `aria-current`:
   * the visible treatment comes from the caller's `className`, because each nav
   * surface dresses its labels differently.
   */
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

export function NavigationItem({
  label,
  href,
  comingSoon = false,
  active = false,
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
    <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} className={className}>
      {children ?? label}
    </Link>
  );
}
