"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock3, Package, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/common/require-auth";
import { useOrder } from "@/hooks/use-orders";
import { formatPrice, cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/order";

const ORDER_STEPS: Array<{ key: OrderStatus; label: string; icon: ReactNode }> = [
  { key: "pending", label: "Pending", icon: <Clock3 className="h-4 w-4" /> },
  { key: "processing", label: "Processing", icon: <Package className="h-4 w-4" /> },
  { key: "shipped", label: "Shipped", icon: <Truck className="h-4 w-4" /> },
  { key: "delivered", label: "Delivered", icon: <CheckCircle2 className="h-4 w-4" /> },
];

const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending payment",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  paid: {
    label: "Paid",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  failed: {
    label: "Payment failed",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

function formatPaymentMethod(method: string): string {
  if (method === "cash_on_delivery") {
    return "Cash on Delivery";
  }

  return method
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STEPS.find((step) => step.key === status)?.label ?? "Pending";
}

export default function OrderSuccessPage() {
  const params = useParams<{ id: string }>();
  const orderId = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  return (
    <RequireAuth>
      <OrderSuccessContent orderId={orderId} />
    </RequireAuth>
  );
}

function OrderSuccessContent({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError, error, refetch, isFetching } = useOrder(orderId);

  const statusCode = (error as { response?: { status?: number } } | undefined)?.response?.status;
  const hasOrderId = orderId.trim().length > 0;
  const isNotFoundError = statusCode === 400 || statusCode === 404;

  if (!hasOrderId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-3xl font-light tracking-tight text-neutral-800">
          Order not found
        </h1>
        <p className="mt-3 text-neutral-400">
          We could not find that order. Please check your orders page.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/orders">View Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (isError || !order) {
    if (isNotFoundError) {
      return (
        <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-light tracking-tight text-neutral-800">
            Order not found
          </h1>
          <p className="mt-3 text-neutral-400">
            We could not find that order. Please check your orders page.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/orders">View Orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-3xl font-light tracking-tight text-neutral-800">
          Could not load order
        </h1>
        <p className="mt-3 text-neutral-400">
          We could not load this order right now. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Retrying..." : "Retry"}
          </Button>
          <Button asChild>
            <Link href="/orders">View Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = order.orderStatus ?? order.status ?? "pending";
  const activeStepIndex = ORDER_STEPS.findIndex((step) => step.key === status);
  const isInsideDhaka = order.shippingAddress.deliveryZone === "inside_dhaka";
  const deliveryWindow = isInsideDhaka ? "2-4 business days" : "3-6 business days";
  const paymentStatusMeta = PAYMENT_STATUS_META[order.paymentStatus];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Card className="overflow-hidden border-rose-100">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 px-6 py-8 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Order Confirmed
                </div>
                <h1 className="mt-4 text-3xl font-light tracking-tight">
                  Your order is placed
                </h1>
                <p className="mt-2 max-w-xl text-sm text-white/85">
                  We have received your order and will contact you if we need
                  any delivery clarification.
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-wider text-white/75">
                  Order ID
                </p>
                <p className="mt-1 font-mono text-sm font-semibold">
                  {order.orderNumber}
                </p>
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wider text-white/75">
                    Order status
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {getOrderStatusLabel(status)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5">
                <h2 className="text-base font-semibold text-neutral-800">
                  Delivery timeline
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {isInsideDhaka
                    ? "Inside Dhaka orders usually move faster through our courier chain."
                    : "Outside Dhaka orders take a little longer because of the extended courier route."}
                </p>

                <div className="mt-5 space-y-3">
                  {ORDER_STEPS.map((step, index) => {
                    const isActive = index <= activeStepIndex;
                    return (
                      <div
                        key={step.key}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                          isActive
                            ? "border-rose-200 bg-white text-neutral-800"
                            : "border-rose-100 bg-white/60 text-neutral-400"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full",
                            isActive ? "bg-rose-100 text-rose-600" : "bg-neutral-100"
                          )}
                        >
                          {step.icon}
                        </div>
                        <div>
                          <p className="font-medium">{step.label}</p>
                          <p className="text-xs text-neutral-500">
                            {step.key === "pending"
                              ? "We have received the order"
                              : step.key === "processing"
                                ? "Our team prepares the package"
                                : step.key === "shipped"
                                  ? `Courier delivery in about ${deliveryWindow}`
                                  : "Delivered successfully"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-base font-semibold text-neutral-800">
                  Order Items
                </h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.sourceId}`}
                      className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-rose-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-neutral-800">
                          {item.title}
                        </p>
                        <p className="text-sm text-neutral-500">
                          Quantity {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-neutral-800">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-rose-100">
                <CardContent className="p-6">
                  <h2 className="text-base font-semibold text-neutral-800">
                    Breakdown
                  </h2>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>Items subtotal</span>
                      <span>{formatPrice(order.itemsTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>Shipping fee</span>
                      <span>{formatPrice(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-rose-100 pt-3 text-sm font-semibold text-neutral-800">
                      <span>Grand total</span>
                      <span className="text-rose-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-2xl bg-rose-50/60 p-4 text-sm text-neutral-600">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400">
                        Customer name
                      </p>
                      <p className="mt-1 font-medium text-neutral-800">
                        {order.shippingAddress.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400">
                        Customer phone
                      </p>
                      <p className="mt-1 font-medium text-neutral-800">
                        {order.shippingAddress.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400">
                        Delivery zone
                      </p>
                      <p className="mt-1 font-medium text-neutral-800">
                        {isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400">
                        Area
                      </p>
                      <p className="mt-1 font-medium text-neutral-800">
                        {order.shippingAddress.area}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400">
                        Full address
                      </p>
                      <p className="mt-1 font-medium text-neutral-800">
                        {order.shippingAddress.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400">
                        Payment method
                      </p>
                      <p className="mt-1 font-medium text-neutral-800">
                        {formatPaymentMethod(order.paymentMethod)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400">
                        Payment status
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("mt-2 w-fit", paymentStatusMeta.className)}
                      >
                        {paymentStatusMeta.label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400">
                        Order status
                      </p>
                      <p className="mt-1 font-medium text-neutral-800">
                        {getOrderStatusLabel(status)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-rose-100">
                <CardContent className="p-6">
                  <h2 className="text-base font-semibold text-neutral-800">
                    Next steps
                  </h2>
                  <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                    <li>1. We confirm the order and prepare your package.</li>
                    <li>2. The courier picks up your parcel.</li>
                    <li>3. You pay cash when it arrives.</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button asChild className="flex-1">
                  <Link href="/orders">View Orders</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
