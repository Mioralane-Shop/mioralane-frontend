"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "./cart-item";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShoppingBag, MessageCircle, Plus } from "lucide-react";
import { DUMMY_PRODUCTS, SITE_WHATSAPP } from "@/constants/site";

export function CartDrawer() {
  const { items, isOpen, closeCart, totalPrice, addItem } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);

  // Cross-sell suggestion (prefer a mask product not already in the cart)
  const inCart = new Set(items.map((i) => i.product.id));
  const crossSell =
    DUMMY_PRODUCTS.find((p) => p.category === "masks" && !inCart.has(p.id)) ??
    DUMMY_PRODUCTS.find((p) => !inCart.has(p.id)) ??
    null;

  const orderText = `Hello Mioralane! 👋 I'd like to place an order:\n${items
    .map(
      (i) =>
        `• ${i.product.name} × ${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`,
    )
    .join("\n")}\n\nTotal: ${formatPrice(totalPrice())}`;

  const waLink = `https://wa.me/${SITE_WHATSAPP}?text=${encodeURIComponent(orderText)}`;

  const handleAddCrossSell = () => {
    if (!crossSell) return;
    addItem(crossSell, 1);
    addToast(`${crossSell.name} added to cart`);
  };

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
            <ShoppingBag className="h-12 w-12 text-neutral-300" />
            <p className="text-neutral-500">Your cart is empty</p>
            <Link href="/shop" onClick={closeCart}>
              <Button variant="outline" size="sm">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {items.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}

              {/* Cross-sell */}
              {crossSell && (
                <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Complete your routine
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white">
                      <Image
                        src={crossSell.images[0]}
                        alt={crossSell.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800">
                        {crossSell.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {crossSell.brand}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-rose-600">
                        {formatPrice(crossSell.price)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddCrossSell}
                      className="flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-rose-100 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
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
