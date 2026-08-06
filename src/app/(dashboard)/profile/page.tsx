"use client";

import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authService } from "@/services/auth.service";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
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
              {user.username}
            </h2>
            <p className="text-sm text-neutral-400">Mioralane member</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              defaultValue={user.username}
              className="mt-1"
              readOnly
            />
          </div>
          <Button className="mt-4" disabled>
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
                // Ignore — local session is cleared regardless.
              }
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
