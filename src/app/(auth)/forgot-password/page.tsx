import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100dvh-120px)] items-center justify-center bg-surface-warm px-4 py-10 md:min-h-[calc(100dvh-168px)]">
      <ForgotPasswordForm />
    </div>
  );
}
