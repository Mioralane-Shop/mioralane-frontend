"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { User, LogOut, Loader2, Package, Heart, Shield, Clock3, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequireAuth } from "@/components/common/require-auth";
import { OrderHistory } from "@/components/orders/order-history";
import { useAuthStore } from "@/store/auth.store";
import { useOrders } from "@/hooks/use-orders";
import { useAccountLogout } from "@/hooks/use-account-logout";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function formatMemberSince(createdAt?: string) {
  if (!createdAt) return "Unknown";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function formatRole(role?: "user" | "admin") {
  if (role === "admin") return "Admin";
  if (role === "user") return "Customer";
  return "Member";
}

function ProfileContent() {
  const { user } = useAuthStore();
  const { data: orders = [], isLoading } = useOrders();
  const handleSignOut = useAccountLogout();

  if (!user) return null;

  const memberSince = formatMemberSince(user.createdAt);
  const accountRole = formatRole(user.role);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-neutral-800">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Read-only account details, order access, and wishlist shortcuts.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)]">
        <Card className="border-brand-100">
          <CardContent className="p-4 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100">
                <User className="h-8 w-8 text-brand-500" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-medium text-neutral-800">
                  {user.username}
                </h2>
                <p className="break-words text-sm text-neutral-400">
                  {user.email ?? "No email available"}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
              <ProfileRow label="Name" value={user.username} icon={<User className="h-4 w-4" />} />
              <ProfileRow label="Email" value={user.email ?? "Not available"} icon={<Mail className="h-4 w-4" />} />
              <ProfileRow label="Role" value={accountRole} icon={<Shield className="h-4 w-4" />} />
              <ProfileRow label="Member since" value={memberSince} icon={<Clock3 className="h-4 w-4" />} />
            </div>

            <div className="mt-8">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/orders">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/wishlist">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 border-t border-brand-100 pt-6">
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => {
                  void handleSignOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-100">
          <CardContent className="p-4 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
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
                <Package className="h-5 w-5 text-brand-500" />
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
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

function ProfileRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="mt-0.5 text-brand-400">{icon}</span>
        <span className="text-sm font-medium text-neutral-500">{label}</span>
      </div>
      <span className="min-w-0 max-w-[65%] break-words text-right text-sm font-medium text-neutral-800">
        {value}
      </span>
    </div>
  );
}
