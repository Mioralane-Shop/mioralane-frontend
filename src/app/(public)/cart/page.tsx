"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/cart-item";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    totalPrice,
    clearCart,
    isSyncingCatalog,
    catalogSyncError,
    canCheckout,
    getCheckoutBlockMessage,
  } = useCartStore();
  const blockMessage = getCheckoutBlockMessage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-neutral-800">
          Shopping Cart
        </h1>
        <p className="mt-1 text-neutral-400">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-brand-100 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <ShoppingBag className="h-8 w-8 text-brand-300" />
          </div>
          <h2 className="mt-5 text-xl font-medium text-neutral-700">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Browse our shop to find products you want to add to your routine.
          </p>
          <Link href="/shop" className="mt-6 inline-block">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-brand-100 bg-white">
              <div className="border-b border-brand-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium text-neutral-700">Cart Items</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-neutral-400 hover:text-red-500"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
              {(isSyncingCatalog || catalogSyncError || blockMessage) && (
                <div className="border-b border-brand-50 bg-brand-50/50 px-6 py-4">
                  <p className="text-sm font-medium text-neutral-800">
                    {isSyncingCatalog
                      ? "Refreshing cart availability"
                      : catalogSyncError
                        ? "One or more items could not be verified"
                        : "Some cart items need attention"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {blockMessage ?? "We are checking the current catalog before checkout."}
                  </p>
                </div>
              )}
              <div className="divide-y divide-brand-50 px-6">
                {items.map((item) => (
                  <CartItemRow
                    key={`${item.itemType}:${item.itemId || item.product.id}`}
                    item={item}
                  />
                ))}
              </div>
              <div className="border-t border-brand-50 px-6 py-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1 text-sm text-brand-500 hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-brand-100 bg-white p-6">
              <h3 className="text-lg font-medium text-neutral-800">
                Order Summary
              </h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-brand-100 pt-2 mt-2">
                  <div className="flex justify-between font-medium text-neutral-800">
                    <span>Total</span>
                    <span className="text-lg text-brand-600">
                      {formatPrice(totalPrice())}
                    </span>
                  </div>
                </div>
              </div>
              {canCheckout() ? (
                <Link href="/checkout">
                  <Button className="mt-6 w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              ) : (
                <Button className="mt-6 w-full" size="lg" disabled>
                  Proceed to Checkout
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-neutral-400">
                Secure checkout with SSL encryption
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
