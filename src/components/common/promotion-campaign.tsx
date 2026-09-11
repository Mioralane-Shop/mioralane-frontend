"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const campaign = {
  title: "LAUNCH OFFER",
  offerText: "UP TO 20% OFF",
  active: true,
};

const excludedPaths = [
  "/login",
  "/register",
  "/checkout",
  "/order-success",
  "/cart",
  "/wishlist",
  "/orders",
  "/profile",
];

export function PromotionCampaign() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const shouldHide =
    !campaign.active ||
    excludedPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (shouldHide || !isVisible) {
    return null;
  }

  const campaignText = `${campaign.title} ✦ ${campaign.offerText}`;

  return (
    <>
      <div className="fixed right-0 top-[52%] z-[90] -translate-y-1/2 sm:top-1/2">
        <button
          type="button"
          aria-label={`Open ${campaign.title} promotion`}
          onClick={() => setIsOpen(true)}
          className="hidden w-12 rounded-l-xl border border-r-0 border-brand-100 bg-white px-3 py-7 text-center text-[14px] font-black uppercase tracking-[0.08em] text-ink shadow-[0_14px_34px_rgba(26,26,26,0.16),0_3px_10px_rgba(255,102,117,0.16)] transition-colors hover:bg-brand-100 hover:shadow-[0_16px_38px_rgba(26,26,26,0.2),0_4px_12px_rgba(255,102,117,0.2)] sm:flex sm:min-h-[224px] sm:items-center sm:justify-center"
        >
          <span className="[writing-mode:vertical-rl]">{campaignText}</span>
        </button>

        <button
          type="button"
          aria-label="Dismiss promotion"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(false);
            setIsVisible(false);
          }}
          className="absolute -bottom-3 left-1 hidden h-5 w-5 items-center justify-center rounded-full bg-ink text-white shadow-[0_6px_14px_rgba(26,26,26,0.35)] transition-colors hover:bg-ink-soft sm:flex"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="fixed bottom-5 right-0 z-[90] sm:hidden">
        <button
          type="button"
          aria-label={`Open ${campaign.title} promotion`}
          onClick={() => setIsOpen(true)}
          className="rounded-l-full border border-r-0 border-brand-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.06em] text-ink shadow-[0_12px_28px_rgba(26,26,26,0.16),0_3px_10px_rgba(255,102,117,0.16)] transition-colors hover:bg-brand-100 hover:shadow-[0_14px_32px_rgba(26,26,26,0.2),0_4px_12px_rgba(255,102,117,0.2)]"
        >
          {campaign.offerText}
        </button>

        <button
          type="button"
          aria-label="Dismiss promotion"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(false);
            setIsVisible(false);
          }}
          className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white shadow-[0_6px_14px_rgba(26,26,26,0.35)] transition-colors hover:bg-ink-soft"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/35 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="promotion-campaign-title"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-lg border border-brand-100 bg-white px-6 py-7 text-center shadow-[0_24px_70px_rgba(26,26,26,0.22),0_8px_24px_rgba(255,102,117,0.12)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close promotion popup"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-brand-50 hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <p
              id="promotion-campaign-title"
              className="text-sm font-black uppercase tracking-[0.18em] text-brand-600"
            >
              {campaign.title}
            </p>
            <p className="mt-3 font-serif text-3xl text-ink">
              {campaign.offerText}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
