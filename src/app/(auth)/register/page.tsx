import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return (
    <div className="flex min-h-[calc(100dvh-120px)] items-center justify-center bg-surface-warm px-4 py-10 md:min-h-[calc(100dvh-168px)]">
      <AuthForm initialMode="register" redirect={searchParams?.redirect} />
    </div>
  );
}
