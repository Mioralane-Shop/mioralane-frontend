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
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-10">
      <AuthForm initialMode="register" redirect={searchParams?.redirect} />
    </div>
  );
}
