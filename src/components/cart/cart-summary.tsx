"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "./cart-item";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, closeCart, totalPrice } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
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
