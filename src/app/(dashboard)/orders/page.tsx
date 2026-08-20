"use client";

import Link from "next/link";
import { AlertCircle, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/common/require-auth";
import { OrderHistory } from "@/components/orders/order-history";
import { useOrders } from "@/hooks/use-orders";

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}

function OrdersContent() {
  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useOrders();

  const orderList = orders ?? [];
  const isInitialLoading = isLoading && orderList.length === 0;
  const statusCode = (error as { response?: { status?: number } } | undefined)?.response?.status;
  const hasError = isError && orderList.length === 0;
  const isNotFoundError = statusCode === 404;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-neutral-800">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Review your past purchases and delivery status.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>

      {isInitialLoading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
          <AlertCircle className="h-16 w-16 text-rose-300" />
          <h2 className="mt-4 text-xl font-medium text-neutral-700">
            {isNotFoundError ? "Orders not found" : "Could not load orders"}
          </h2>
          <p className="mt-2 text-neutral-400">
            {isNotFoundError
              ? "We could not load your order history right now."
              : "There was a problem fetching your order history. Please try again."}
          </p>
          <Button className="mt-6" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Retrying..." : "Retry"}
          </Button>
        </div>
      ) : orderList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
          <Package className="h-16 w-16 text-neutral-300" />
          <h2 className="mt-4 text-xl font-medium text-neutral-600">
            No orders yet
          </h2>
          <p className="mt-2 text-neutral-400">
            Your order history will appear here after checkout.
          </p>
          <Link href="/shop" className="mt-6">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <OrderHistory orders={orderList} />
      )}
    </div>
  );
}
