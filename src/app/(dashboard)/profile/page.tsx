"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { User, LogOut, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RequireAuth } from "@/components/common/require-auth";
import { OrderHistory } from "@/components/orders/order-history";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { useOrders } from "@/hooks/use-orders";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { user, logout } = useAuthStore();
  const { data: orders = [], isLoading } = useOrders();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-neutral-800">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your account and track recent orders.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)]">
        <Card className="border-rose-100">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                <User className="h-8 w-8 text-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-neutral-800">
                  {user.username}
                </h2>
                <p className="text-sm text-neutral-400">
                  {user.email ?? "Mioralane member"}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  defaultValue={user.username}
                  className="mt-1"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue={user.email ?? ""}
                  className="mt-1"
                  readOnly
                />
              </div>
              <Button className="mt-2" disabled>
                Save Changes
              </Button>
            </div>

            <div className="mt-8 border-t border-rose-100 pt-6">
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={async () => {
                  try {
                    await authService.logout();
                  } catch {
                    // Ignore network failures. Local session is cleared regardless.
                  }
                  logout();
                  router.push("/");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100">
          <CardContent className="p-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-neutral-800">
                  Recent Orders
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Your latest order activity appears here.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/orders">View all orders</Link>
                </Button>
                <Package className="h-5 w-5 text-rose-500" />
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : (
              <OrderHistory
                orders={orders}
                limit={3}
                emptyTitle="No orders yet"
                emptyDescription="Once you place an order, it will show up here and on your full orders page."
                footer={
                  <Button asChild>
                    <Link href="/shop">Shop now</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
