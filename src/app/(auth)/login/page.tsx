"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    // Simulate login - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    login(
      { id: "1", name: "Jane Doe", email: data.email },
      "mock-token-123"
    );
    router.push("/");
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-2xl font-light tracking-wide text-rose-600"
          >
            Mioralane
          </Link>
          <h1 className="mt-4 text-2xl font-light text-neutral-800">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Sign in to access your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-rose-100 bg-white p-8 space-y-5"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="jane@example.com"
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-rose-500 hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
