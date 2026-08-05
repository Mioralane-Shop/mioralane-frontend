"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators/checkout";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Order placed:", data, items);
    clearCart();
    router.push("/orders");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-light text-neutral-800">
          Your cart is empty
        </h1>
        <p className="mt-2 text-neutral-400">
          Add some products before checking out.
        </p>
        <Link href="/shop" className="mt-4 inline-block">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-rose-500 hover:underline mb-6"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-light tracking-tight text-neutral-800 mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <div className="rounded-2xl border border-rose-100 bg-white p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">
                Shipping Information
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="Jane Doe"
                    className="mt-1"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="jane@example.com"
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="123 Main Street"
                    className="mt-1"
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="New York"
                    className="mt-1"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...register("state")}
                    placeholder="NY"
                    className="mt-1"
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    {...register("zipCode")}
                    placeholder="10001"
                    className="mt-1"
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.zipCode.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder="United States"
                    className="mt-1"
                  />
                  {errors.country && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="rounded-2xl border border-rose-100 bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-medium text-neutral-800 mb-4">
                <CreditCard className="h-5 w-5 text-rose-400" />
                Payment Information
              </h2>
              <div className="grid gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    {...register("cardName")}
                    placeholder="Jane Doe"
                    className="mt-1"
                  />
                  {errors.cardName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.cardName.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    {...register("cardNumber")}
                    placeholder="4242 4242 4242 4242"
                    className="mt-1"
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.cardNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    {...register("expiryDate")}
                    placeholder="MM/YY"
                    className="mt-1"
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.expiryDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    {...register("cvv")}
                    placeholder="123"
                    className="mt-1"
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.cvv.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-rose-100 bg-white p-6">
              <h3 className="text-lg font-medium text-neutral-800">
                Order Summary
              </h3>

              <div className="mt-4 divide-y divide-rose-50">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between py-2 text-sm"
                  >
                    <span className="text-neutral-600">
                      {item.product.name}{" "}
                      <span className="text-neutral-400">
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-rose-100 pt-4">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-medium text-neutral-800 pt-2 border-t border-rose-100">
                  <span>Total</span>
                  <span className="text-lg text-rose-600">
                    {formatPrice(totalPrice())}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="mt-6 w-full"
                size="lg"
                disabled={isSubmitting}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>

              <p className="mt-3 text-center text-xs text-neutral-400">
                Your payment info is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
