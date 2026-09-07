"use client";

import { useState, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { GoogleLogin } from "@react-oauth/google";

export type AuthMode = "login" | "register";

interface AuthFormProps {
  initialMode?: AuthMode;
  /** Internal path to send the user to after a successful login/register. */
  redirect?: string;
  className?: string;
}

interface FieldErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}

const USERNAME_MIN = 3;
const PASSWORD_MIN = 6;

export function AuthForm({
  initialMode = "login",
  redirect,
  className,
}: AuthFormProps) {
  const router = useRouter();
  const { login } = useAuthStore();

  // Only allow same-origin internal paths (avoids open-redirect via ?redirect=).
  const redirectTo = useMemo(() => {
    if (
      redirect &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//") &&
      !redirect.includes("\\")
    ) {
      return redirect;
    }
    return "/";
  }, [redirect]);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === "register";

  /** Client-side validation — empty fields + minimum lengths + match check. */
  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!username.trim()) {
      next.username = "Username is required";
    } else if (username.trim().length < USERNAME_MIN) {
      next.username = `Username must be at least ${USERNAME_MIN} characters`;
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < PASSWORD_MIN) {
      next.password = `Password must be at least ${PASSWORD_MIN} characters`;
    }

    if (isRegister) {
      if (!confirmPassword) {
        next.confirmPassword = "Please confirm your password";
      } else if (confirmPassword !== password) {
        next.confirmPassword = "Passwords do not match";
      }
    }

    return next;
  };

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    // Keep the username; reset sensitive/error state for a seamless switch.
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setErrors({});
    setServerError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    setServerError(null);
    setSuccess(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const payload = { username: username.trim(), password, email: email.trim() };
      const { user, message } = isRegister
        ? await authService.register(payload.username, payload.email, payload.password)
        : await authService.login(payload.username, payload.password);

      if (user) {
        login(user);
      }

      setSuccess(
        message || (isRegister ? "Account created successfully!" : "Welcome back!")
      );

      // Give the user a moment to register the success state before redirecting.
      window.setTimeout(() => router.push(redirectTo), 900);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        code?: string;
      };
      const backendMessage = err.response?.data?.message;
      if (backendMessage) {
        setServerError(backendMessage);
      } else if (err.code === "ERR_NETWORK") {
        setServerError(
          "Unable to reach the server. Please check your connection and try again."
        );
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /** Handles the Google One Tap / Sign-In credential response. */
  const handleGoogleSuccess = async (response: { credential?: string }) => {
    if (!response.credential) return;

    setIsLoading(true);
    setServerError(null);
    setSuccess(null);

    try {
      const { user, message } = await authService.googleLogin(
        response.credential
      );

      if (user) {
        login(user);
      }

      setSuccess(message || "Signed in with Google successfully!");
      window.setTimeout(() => router.push(redirectTo), 900);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        code?: string;
      };
      setServerError(
        err.response?.data?.message || "Google sign-in failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-[440px]",
        className
      )}
    >
      <section className="rounded-xl border border-border bg-white/90 px-6 py-7 shadow-lg shadow-brand-100/30 backdrop-blur sm:px-10 sm:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-brand-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to shop
        </Link>

        <div className="mb-8">
          <BrandLogo size="md" priority className="mb-6" />
          <h1 className="font-serif text-[26px] text-ink">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            {isRegister
              ? "Join the Glow Club and start your K-beauty ritual."
              : "Sign in to continue your skincare journey."}
          </p>
        </div>

        {/* Status alerts */}
        {(serverError || success) && (
          <div aria-live={serverError ? "assertive" : "polite"} className="mb-6">
            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}
            {success && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}
          </div>
        )}

        <form
          id="panel-auth"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4"
        >
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[13px] text-ink">
              Username
            </Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. glowqueen"
                autoComplete="username"
                disabled={isLoading}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? "username-error" : undefined}
                className={cn(
                  "h-11 rounded-lg border-border bg-surface-warm pl-10 focus-visible:ring-brand-200",
                  errors.username && "border-red-300"
                )}
              />
            </div>
            {errors.username && (
              <p
                id="username-error"
                role="alert"
                className="flex items-center gap-1.5 text-xs text-red-500"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.username}
              </p>
            )}
          </div>

          {/* Email (register only) */}
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] text-ink">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className="h-11 rounded-lg border-border bg-surface-warm pl-10 focus-visible:ring-brand-200"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[13px] text-ink">
                Password
              </Label>
              {!isRegister && (
                <button
                  type="button"
                  className="text-[13px] font-medium text-brand-500 transition-colors hover:text-brand-600 hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Min. 6 characters" : "Enter your password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                disabled={isLoading}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={cn(
                  "h-11 rounded-lg border-border bg-surface-warm pl-10 pr-11 focus-visible:ring-brand-200",
                  errors.password && "border-red-300"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                role="alert"
                className="flex items-center gap-1.5 text-xs text-red-500"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm password (register only) */}
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[13px] text-ink">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword ? "confirm-password-error" : undefined
                  }
                  className={cn(
                    "h-11 rounded-lg border-border bg-surface-warm pl-10 pr-11 focus-visible:ring-brand-200",
                    errors.confirmPassword && "border-red-300"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-red-500"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            aria-busy={isLoading}
            className="mt-2 h-11 w-full rounded-full bg-brand-500 text-sm shadow-sm hover:bg-brand-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : isRegister ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Google Sign-In */}
          <div className="relative py-2">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-[13px] text-ink-muted">
                or continue with
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setServerError("Google sign-in failed. Please try again.")
              }
              size="large"
              text="signin_with"
              shape="pill"
              theme="outline"
              width="360"
            />
          </div>

          <p className="text-center text-xs leading-relaxed text-ink-muted">
            By continuing, you agree to Mioralane&apos;s Terms of Service &
            Privacy Policy.
          </p>

          <p className="text-center text-[13px] text-ink-soft">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isRegister ? "login" : "register")}
              className="font-medium text-brand-500 transition-colors hover:text-brand-600 hover:underline"
            >
              {isRegister ? "Sign in" : "Create one"}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
