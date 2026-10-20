import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; reset?: string }>;
}) {
  const { redirect, reset } = await searchParams;

  return (
    <div className="flex min-h-[calc(100dvh-120px)] items-center justify-center bg-gray-50 px-4 py-10 md:min-h-[calc(100dvh-168px)]">
      <AuthForm
        initialMode="login"
        redirect={redirect}
        successMessage={
          reset === "success"
            ? "Your password has been updated. Sign in with your new password."
            : undefined
        }
      />
    </div>
  );
}
