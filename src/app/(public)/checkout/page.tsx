"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/common/require-auth";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";
import { useCreateOrder } from "@/hooks/use-orders";
import { formatPrice, cn } from "@/lib/utils";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators/checkout";

const SHIPPING_FEES = {
  inside_dhaka: 80,
  outside_dhaka: 150,
} as const;

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const addToast = useToastStore((state) => state.addToast);
  const createOrder = useCreateOrder();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.username ?? "",
      phone: "",
      deliveryZone: "inside_dhaka",
      area: "",
      address: "",
    },
  });

  useEffect(() => {
    if (user?.username) {
      setValue("name", user.username);
    }
  }, [setValue, user?.username]);

  const deliveryZone = watch("deliveryZone");
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingFee = SHIPPING_FEES[deliveryZone];
  const totalAmount = subtotal + shippingFee;
  const hasUnavailableItem = items.some(
    (item) => item.product.stock <= 0 || item.quantity > item.product.stock
  );

  const onSubmit = async (values: CheckoutFormValues) => {
    setServerError(null);

    if (hasUnavailableItem) {
      setServerError(
        "One or more items in your cart are out of stock. Please update the cart before placing the order."
      );
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        items: items.map((item) => ({
          itemId: item.product.id,
          itemType: item.product.itemType ?? (item.product.category === "combo" ? "combo" : "product"),
          title: item.product.name,
          price: item.product.price,
          thumbnail: item.product.images?.[0] ?? "",
          quantity: item.quantity,
        })),
        shippingAddress: values,
        paymentMethod: "cash_on_delivery",
      });

      clearCart();
      addToast(`Order ${order.orderNumber} placed successfully`, "success");
      router.push(`/order-success/${order.id}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to place order. Please try again.";
      setServerError(message);
      addToast(message, "error");
    }
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
        className="mb-6 inline-flex items-center gap-1 text-sm text-rose-500 hover:underline"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Cart
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-neutral-800">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Confirm your delivery details and place your order.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <div className="space-y-8">
            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-neutral-800">
                    Shipping Information
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    We deliver inside Dhaka for ৳80 and outside Dhaka for ৳150.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">Recipient Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Jane Doe"
                      className="mt-1"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="01XXXXXXXXX"
                      className="mt-1"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Delivery Location</Label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {[
                        { value: "inside_dhaka", label: "Inside Dhaka" },
                        { value: "outside_dhaka", label: "Outside Dhaka" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setValue(
                              "deliveryZone",
                              option.value as "inside_dhaka" | "outside_dhaka",
                              { shouldDirty: true, shouldTouch: true }
                            )
                          }
                          className={cn(
                            "rounded-2xl border px-4 py-3 text-sm font-medium transition-colors",
                            deliveryZone === option.value
                              ? "border-rose-300 bg-rose-50 text-rose-700"
                              : "border-rose-100 bg-white text-neutral-600 hover:bg-rose-50/60"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {errors.deliveryZone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.deliveryZone.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="area">City / Area</Label>
                    <Input
                      id="area"
                      {...register("area")}
                      placeholder="Dhanmondi, Uttara, Chattogram..."
                      className="mt-1"
                    />
                    {errors.area && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.area.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Detailed Address</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="House, road, floor, landmark"
                      className="mt-1"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-rose-500" />
                  <h2 className="text-lg font-medium text-neutral-800">
                    Payment Method
                  </h2>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="mt-1 h-4 w-4 border-rose-300 text-rose-500 focus:ring-rose-300"
                  />
                  <div>
                    <p className="font-medium text-neutral-800">
                      Cash on Delivery
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Pay the rider when your order arrives.
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="border-rose-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-neutral-800">
                  Order Summary
                </h3>

                <div className="mt-4 divide-y divide-rose-50">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start justify-between gap-3 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-700">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 font-medium text-neutral-800">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-rose-100 pt-4">
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>Shipping</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-rose-100 pt-3 font-medium text-neutral-800">
                    <span>Total</span>
                    <span className="text-lg text-rose-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-rose-50/50 p-4 text-sm text-neutral-600">
                  <div className="flex items-center gap-2 font-medium text-neutral-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Delivery timeline
                  </div>
                  <p className="mt-2">
                    Inside Dhaka usually arrives in 2-4 business days. Outside
                    Dhaka usually arrives in 3-6 business days.
                  </p>
                </div>

                {hasUnavailableItem && (
                  <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    One or more cart items are currently out of stock. Remove
                    them or reduce the quantity before checkout.
                  </p>
                )}

                {serverError && (
                  <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {serverError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full"
                  disabled={createOrder.isPending || hasUnavailableItem}
                >
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <p className="mt-3 text-center text-xs text-neutral-400">
                  By placing this order, you agree to confirm the shipping
                  address and pay cash on delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
