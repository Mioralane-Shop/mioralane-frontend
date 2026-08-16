"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, Clock3, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, cn } from "@/lib/utils";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";

const STATUS_META: Record<OrderStatus, { label: string; className: string; icon: ReactNode }> = {
  pending: {
    label: "Pending",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
    icon: <Clock3 className="h-4 w-4" />,
  },
  processing: {
    label: "Processing",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Package className="h-4 w-4" />,
  },
  shipped: {
    label: "Shipped",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Truck className="h-4 w-4" />,
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

const PAYMENT_META: Record<PaymentStatus, string> = {
  pending: "Pending payment",
  paid: "Paid",
  failed: "Payment failed",
};

function getOrderStatus(order: Order): OrderStatus {
  return order.orderStatus ?? order.status ?? "pending";
}

export function OrderHistory({
  orders,
  limit,
  emptyTitle = "No orders yet",
  emptyDescription = "Your order history will appear here once you place your first order.",
  footer,
}: {
  orders: Order[];
  limit?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  footer?: ReactNode;
}) {
  const visibleOrders = typeof limit === "number" ? orders.slice(0, limit) : orders;

  if (visibleOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
        <Package className="h-12 w-12 text-ink-muted/30" />
        <h3 className="mt-4 text-lg font-semibold text-ink">{emptyTitle}</h3>
        <p className="mt-2 max-w-md text-sm text-ink-muted">{emptyDescription}</p>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleOrders.map((order) => {
        const status = getOrderStatus(order);
        const statusMeta = STATUS_META[status];
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

        return (
          <Card key={order.id} className="border-rose-100">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">
                      Order #{order.orderNumber}
                    </p>
                    <Badge variant="outline" className={cn("gap-1.5", statusMeta.className)}>
                      {statusMeta.icon}
                      {statusMeta.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    - {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    Payment
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {PAYMENT_META[order.paymentStatus]}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {order.items.slice(0, 4).map((item) => (
                  <div key={`${order.id}-${item.productId}`} className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-rose-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
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

              <div className="mt-5 grid gap-3 rounded-2xl bg-rose-50/50 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    Items total
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {formatPrice(order.itemsTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    Shipping
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {formatPrice(order.shippingFee)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    Grand total
                  </p>
                  <p className="mt-1 text-sm font-semibold text-rose-600">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-rose-100 pt-4">
                <div className="text-sm text-ink-muted">
                  Delivery to{" "}
                  <span className="font-medium text-ink">
                    {order.shippingAddress.area}
                  </span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/order-success/${order.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
