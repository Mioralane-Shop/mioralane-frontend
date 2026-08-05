"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Package, Clock, CheckCircle, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/product";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const DUMMY_ORDERS: Order[] = [
  {
    id: "MIOR-2024-001",
    items: [
      {
        productId: "1",
        name: "Radiance Glow Serum",
        price: 48.0,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop",
      },
      {
        productId: "2",
        name: "Ceramide Barrier Cream",
        price: 42.0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=100&h=100&fit=crop",
      },
    ],
    total: 138.0,
    status: "delivered",
    createdAt: "2024-07-15",
    shippingAddress: {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+1 (555) 000-0000",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
    },
  },
  {
    id: "MIOR-2024-002",
    items: [
      {
        productId: "4",
        name: "Snail Mucin Essence",
        price: 39.0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=100&h=100&fit=crop",
      },
    ],
    total: 39.0,
    status: "shipped",
    createdAt: "2024-08-01",
    shippingAddress: {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+1 (555) 000-0000",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
    },
  },
];

const statusIcon = {
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  confirmed: <CheckCircle className="h-4 w-4 text-blue-500" />,
  shipped: <Truck className="h-4 w-4 text-purple-500" />,
  delivered: <CheckCircle className="h-4 w-4 text-green-500" />,
};

const statusColor: Record<string, "default" | "secondary" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  shipped: "default",
  delivered: "outline",
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-light tracking-tight text-neutral-800 mb-8">
        My Orders
      </h1>

      {DUMMY_ORDERS.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Package className="h-16 w-16 text-neutral-300" />
          <h2 className="mt-4 text-xl font-medium text-neutral-600">
            No orders yet
          </h2>
          <p className="mt-2 text-neutral-400">
            Your order history will appear here.
          </p>
          <Link href="/shop" className="mt-6">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {DUMMY_ORDERS.map((order) => (
            <Card key={order.id} className="border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon[order.status]}
                    <Badge variant={statusColor[order.status]}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-neutral-600">
                        {item.name}{" "}
                        <span className="text-neutral-400">
                          x{item.quantity}
                        </span>
                      </span>
                      <span className="font-medium text-neutral-700">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-rose-50 pt-3">
                  <span className="text-sm font-medium text-neutral-600">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-rose-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
