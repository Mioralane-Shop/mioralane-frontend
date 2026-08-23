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
  const { items, isOpen, closeCart, totalPrice } = useCartStore();

  const orderText = `Hello Mioralane! ðŸ‘‹ I'd like to place an order:\n${items
    .map(
      (i) =>
        `â€¢ ${i.product.name} Ã— ${i.quantity} â€” ${formatPrice(i.product.price * i.quantity)}`,
    )
    .join("\n")}\n\nTotal: ${formatPrice(totalPrice())}`;

  const waLink = `https://wa.me/${SITE_WHATSAPP}?text=${encodeURIComponent(orderText)}`;

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-rose-100 px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-medium">
            <ShoppingBag className="h-5 w-5 text-rose-500" />
            Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <ShoppingBag className="h-7 w-7 text-rose-300" />
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
              {items.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </div>

            <div className="border-t border-rose-100 px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Subtotal
                </span>
                <span className="text-lg font-semibold text-rose-600">
                  {formatPrice(totalPrice())}
                </span>
              </div>
              <p className="mb-4 text-xs text-neutral-400">
                Shipping and taxes calculated at checkout
              </p>
              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full" size="lg">
                  Checkout
                </Button>
              </Link>
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
                className="mt-2 block text-center text-sm text-rose-500 hover:underline"
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
