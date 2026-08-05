"use client";

import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-light tracking-tight text-neutral-800 mb-8">
        My Profile
      </h1>

      <div className="rounded-2xl border border-rose-100 bg-white p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <User className="h-8 w-8 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-neutral-800">
              {user.name}
            </h2>
            <p className="text-sm text-neutral-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={user.name} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user.email}
              className="mt-1"
            />
          </div>
          <Button className="mt-4">Save Changes</Button>
        </div>

        <div className="mt-8 border-t border-rose-100 pt-6">
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
