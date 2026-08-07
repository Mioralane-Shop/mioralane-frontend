"use client";

import { useState, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Truck,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

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

const TRUST_POINTS: { icon: LucideIcon; text: string }[] = [
  { icon: BadgeCheck, text: "100% authentic K-beauty essentials" },
  { icon: Truck, text: "Fast, tracked delivery across Bangladesh" },
  { icon: ShieldCheck, text: "Secure, private & encrypted account" },
];

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
      const payload = { username: username.trim(), password };
      const { user, message } = isRegister
        ? await authService.register(payload.username, payload.password)
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

  return (
    <div
      className={cn(
        "grid w-full max-w-5xl overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-lg lg:grid-cols-[1fr_1.05fr]",
        className
      )}
    >
      {/* ============ Branding panel (desktop) ============ */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-50 via-brand-100/70 to-peach/20 p-10 lg:flex">
        {/* Decorative soft blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-peach/25 blur-3xl"
        />

        {/* Brand mark */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-300 to-brand-500 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-serif text-2xl tracking-wide text-ink">
            Mioralane
          </span>
        </div>

        {/* Heading */}
        <div className="relative mt-12 space-y-4">
          <h2 className="font-serif text-4xl leading-tight text-ink">
            Your skin,
            <br />
            <span className="text-brand-500">your glow.</span>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
            Discover clean, effective K-beauty curated for your ritual —
            simple, gentle, radiant.
          </p>
        </div>

        {/* Trust points */}
        <ul className="relative mt-12 space-y-3">
          {TRUST_POINTS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 text-sm text-ink-soft"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-brand-500 shadow-sm">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        {/* Social proof */}
        <figure className="relative mt-12 rounded-2xl border border-white/60 bg-white/60 p-5 backdrop-blur">
          <blockquote className="font-serif text-sm italic leading-relaxed text-ink">
            “Mioralane made my routine feel like self-care again. The glow-up
            is real.”
          </blockquote>
          <figcaption className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
            Nusrat · Verified customer
          </figcaption>
        </figure>
      </aside>

      {/* ============ Form panel ============ */}
      <section className="flex flex-col justify-center bg-surface-warm px-6 py-10 sm:px-12 lg:py-16">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-brand-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to shop
        </Link>

        {/* Mode toggle */}
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="mb-8 grid grid-cols-2 gap-1 rounded-full bg-brand-100/60 p-1"
        >
          <button
            type="button"
            role="tab"
            id="tab-login"
            aria-selected={!isRegister}
            aria-controls="panel-auth"
            onClick={() => switchMode("login")}
            className={cn(
              "rounded-full px-4 py-2.5 text-sm font-medium transition-all",
              !isRegister
                ? "bg-white text-brand-600 shadow-sm"
                : "text-ink/60 hover:text-ink"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            id="tab-register"
            aria-selected={isRegister}
            aria-controls="panel-auth"
            onClick={() => switchMode("register")}
            className={cn(
              "rounded-full px-4 py-2.5 text-sm font-medium transition-all",
              isRegister
                ? "bg-white text-brand-600 shadow-sm"
                : "text-ink/60 hover:text-ink"
            )}
          >
            Create Account
          </button>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-ink">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
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
                className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}
            {success && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}
          </div>
        )}

        <form
          id="panel-auth"
          role="tabpanel"
          aria-labelledby={isRegister ? "tab-register" : "tab-login"}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
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
                  "h-12 rounded-2xl pl-10",
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

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {!isRegister && (
                <button
                  type="button"
                  className="text-xs font-medium text-brand-500 transition-colors hover:text-brand-600 hover:underline"
                >
                  Forgot password?
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
                  "h-12 rounded-2xl pl-10 pr-11",
                  errors.password && "border-red-300"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500"
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                    "h-12 rounded-2xl pl-10 pr-11",
                    errors.confirmPassword && "border-red-300"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500"
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
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-brand-400 to-brand-500 shadow-md hover:from-brand-500 hover:to-brand-600"
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

          <p className="text-center text-xs leading-relaxed text-ink-muted">
            By continuing, you agree to Mioralane&apos;s Terms of Service &
            Privacy Policy.
          </p>
        </form>
      </section>
    </div>
  );
}
