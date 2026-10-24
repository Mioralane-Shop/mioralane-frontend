import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100dvh-120px)] items-center justify-center bg-surface-warm px-4 py-10 md:min-h-[calc(100dvh-168px)]">
      <Suspense
        fallback={
          <div className="w-full max-w-[440px] rounded-xl border border-border bg-white/90 px-4 py-7 text-center text-sm text-ink-soft shadow-lg shadow-brand-100/30 backdrop-blur sm:px-10 sm:py-10">
            Loading your reset link…
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
