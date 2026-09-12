"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/common/product-image";
import { orderService } from "@/services/order.service";
import { formatPrice } from "@/lib/utils";

export default function OrderSuccessPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: Boolean(orderId),
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-border-light bg-white p-8 text-center">
          <Clock3 className="mx-auto h-10 w-10 animate-pulse text-brand-500" />
          <h1 className="mt-4 text-2xl font-semibold text-ink">
            Loading your order
          </h1>
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-border-light bg-white p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-ink/30" />
          <h1 className="mt-4 text-2xl font-semibold text-ink">
            We could not load this order
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Please try again in a moment or check your order history.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={() => void refetch()}>
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/orders">Order history</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="mt-4 text-3xl font-semibold text-ink">
          Order confirmed
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Order #{order.orderNumber} - {itemCount}{" "}
          {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <Card className="border-brand-100">
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 border-b border-border-light pb-5 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">
                Payment
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-ink">
                {order.paymentStatus.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-ink">
                {(order.orderStatus ?? order.status ?? "pending").replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">
                Total
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-600">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {order.items.map((item) => (
              <div key={item.sourceId} className="flex min-w-0 items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                  <ProductImage
                    src={item.thumbnail ?? ""}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                    fallbackId={item.sourceId}
                    deliveryPreset="thumbnail"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-ink">
                    {item.title}
                  </p>
                  <p className="text-xs text-ink-muted">Qty {item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-ink">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-brand-50/50 p-4">
            <p className="text-xs uppercase tracking-wider text-ink-muted">
              Delivery address
            </p>
            <p className="mt-2 text-sm font-medium text-ink">
              {order.shippingAddress.name}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {order.shippingAddress.phone}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {[order.shippingAddress.area, order.shippingAddress.district, order.shippingAddress.division].filter(Boolean).join(", ")}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {order.shippingAddress.address}
            </p>
            {order.shippingAddress.landmark ? (
              <p className="mt-1 text-sm text-ink-muted">
                {order.shippingAddress.landmark}
              </p>
            ) : null}
            {order.shipping ? (
              <p className="mt-2 text-xs text-ink-muted">
                Estimated delivery: {order.shipping.estimatedMinDays}-{order.shipping.estimatedMaxDays} business days
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/orders">View orders</Link>
        </Button>
      </div>
    </main>
  );
}
