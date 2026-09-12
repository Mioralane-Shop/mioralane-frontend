"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivePromotion } from "@/hooks/use-active-promotion";

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
  const { data: campaign, isLoading, isError } = useActivePromotion();
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shouldHide =
    isLoading ||
    isError ||
    !campaign ||
    !campaign.floatingTab?.enabled ||
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

  useEffect(() => {
    setIsVisible(true);
    setIsOpen(false);
  }, [campaign?.id]);

  if (shouldHide || !isVisible || !campaign) {
    return null;
  }

  const activeCampaign = campaign;
  const campaignText = [activeCampaign.floatingTab.title, activeCampaign.floatingTab.subtitle]
    .filter(Boolean)
    .join(" ");
  const couponCode = activeCampaign.popup.coupon?.code;
  const showLink =
    activeCampaign.popup.actionType === "link" ||
    activeCampaign.popup.actionType === "coupon_link";
  const showCoupon =
    Boolean(couponCode) &&
    (activeCampaign.popup.actionType === "coupon" ||
      activeCampaign.popup.actionType === "coupon_link");

  async function copyCoupon() {
    if (!couponCode) return;
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function actionText() {
    if (activeCampaign.campaignType === "automatic_discount" && activeCampaign.discount) {
      const value =
        activeCampaign.discount.type === "percentage"
          ? `${activeCampaign.discount.value}%`
          : `BDT ${activeCampaign.discount.value}`;
      return `${value} off automatically applied. No code needed.`;
    }

    if (activeCampaign.campaignType === "free_delivery") {
      return "Free delivery on eligible orders. No code needed.";
    }

    if (activeCampaign.campaignType === "free_gift") {
      return "Free gift on eligible orders.";
    }

    return activeCampaign.floatingTab.subtitle ?? activeCampaign.name;
  }

  return (
    <>
      <div className="fixed right-0 top-[52%] z-[90] -translate-y-1/2 sm:top-1/2">
        <button
          type="button"
          aria-label={`Open ${activeCampaign.name} promotion`}
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
          aria-label={`Open ${activeCampaign.name} promotion`}
          onClick={() => setIsOpen(true)}
          className="max-w-[86vw] rounded-l-full border border-r-0 border-brand-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.06em] text-ink shadow-[0_12px_28px_rgba(26,26,26,0.16),0_3px_10px_rgba(255,102,117,0.16)] transition-colors hover:bg-brand-100 hover:shadow-[0_14px_32px_rgba(26,26,26,0.2),0_4px_12px_rgba(255,102,117,0.2)]"
        >
          <span className="line-clamp-1">
            {activeCampaign.floatingTab.subtitle || activeCampaign.floatingTab.title}
          </span>
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
            className="relative w-full max-w-sm rounded-lg border border-brand-100 bg-white px-4 py-5 text-center shadow-[0_24px_70px_rgba(26,26,26,0.22),0_8px_24px_rgba(255,102,117,0.12)] sm:px-6 sm:py-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close promotion popup"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-soft transition-colors hover:bg-brand-50 hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {activeCampaign.popup.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeCampaign.popup.posterUrl}
                alt={activeCampaign.popup.posterAlt || activeCampaign.name}
                className="aspect-[4/5] w-full rounded-md object-cover"
              />
            ) : null}
            <p
              id="promotion-campaign-title"
              className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-brand-600"
            >
              {activeCampaign.floatingTab.title}
            </p>
            {activeCampaign.floatingTab.subtitle ? (
              <p className="mt-2 font-serif text-3xl text-ink">
                {activeCampaign.floatingTab.subtitle}
              </p>
            ) : null}
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {actionText()}
            </p>
            {showCoupon && couponCode ? (
              <div className="mt-4 flex items-center justify-between gap-2 rounded-md border border-dashed border-brand-300 bg-brand-50 px-3 py-2">
                <span className="font-mono text-sm font-bold text-ink">
                  {couponCode}
                </span>
                <button
                  type="button"
                  onClick={copyCoupon}
                  className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-bold uppercase text-brand-600 hover:bg-white"
                  aria-label="Copy coupon code"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            ) : null}
            {showLink && activeCampaign.popup.ctaUrl ? (
              <Button asChild className="mt-4 w-full" onClick={() => setIsOpen(false)}>
                <Link href={activeCampaign.popup.ctaUrl}>
                  {activeCampaign.popup.ctaLabel || "Shop Now"}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
