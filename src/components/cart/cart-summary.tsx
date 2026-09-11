"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "./cart-item";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { SITE_WHATSAPP } from "@/constants/site";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    totalPrice,
    isSyncingCatalog,
    catalogSyncError,
    canCheckout,
    getCheckoutBlockMessage,
  } = useCartStore();

  const purchasableItems = items.filter(
    (item) =>
      item.catalogStatus === "verified" &&
      item.product.stock > 0 &&
      item.quantity <= item.product.stock,
  );

  const orderText = `Hello Mioralane! I'd like to place an order:\n${purchasableItems
    .map(
      (item) =>
        `- ${item.product.name} x ${item.quantity} - ${formatPrice(
          item.product.price * item.quantity,
        )}`,
    )
    .join("\n")}\n\nTotal: ${formatPrice(totalPrice())}`;

  const waLink = `https://wa.me/${SITE_WHATSAPP}?text=${encodeURIComponent(orderText)}`;
  const blockMessage = getCheckoutBlockMessage();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-brand-100 px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-medium">
            <ShoppingBag className="h-5 w-5 text-brand-500" />
            Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
              <ShoppingBag className="h-7 w-7 text-brand-300" />
            </div>
            <p className="text-base font-medium text-neutral-700">
              Your cart is empty
            </p>
            <p className="max-w-xs text-sm text-neutral-400">
              Browse our shop to find products you want to add to your routine.
            </p>
            <Link href="/shop" onClick={closeCart}>
              <Button variant="outline" size="sm">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {(isSyncingCatalog || catalogSyncError || blockMessage) && (
                <div className="mb-4 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-sm text-neutral-600">
                  <p className="font-medium text-neutral-800">
                    {isSyncingCatalog
                      ? "Refreshing cart availability"
                      : catalogSyncError
                        ? "One or more items could not be verified"
                        : "Some cart items need attention"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {blockMessage ??
                      "We are checking current product and bundle data before checkout."}
                  </p>
                </div>
              )}

              {items.map((item) => (
                <CartItemRow
                  key={`${item.itemType}:${item.itemId || item.product.id}`}
                  item={item}
                />
              ))}
            </div>

            <div className="border-t border-brand-100 px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Subtotal
                </span>
                <span className="text-lg font-semibold text-brand-600">
                  {formatPrice(totalPrice())}
                </span>
              </div>

              {!isSyncingCatalog && purchasableItems.length !== items.length && (
                <p className="mb-4 text-xs text-neutral-400">
                  Unavailable items are excluded from the subtotal until they
                  are resolved.
                </p>
              )}

              <p className="mb-4 text-xs text-neutral-400">
                Shipping and taxes calculated at checkout
              </p>

              {canCheckout() ? (
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full" size="lg">
                    Checkout
                  </Button>
                </Link>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  Checkout unavailable
                </Button>
              )}

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 py-3 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" />
                Order via WhatsApp
              </a>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-2 block text-center text-sm text-brand-500 hover:underline"
              >
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
