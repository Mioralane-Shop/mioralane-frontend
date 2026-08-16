"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import type { ReactNode } from "react";

export function RequireAuth({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, _ready } = useAuthStore();

  useEffect(() => {
    if (_ready && !isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
    }
  }, [_ready, isAuthenticated, router]);

  if (!_ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
