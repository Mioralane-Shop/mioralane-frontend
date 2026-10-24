"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatApiError } from "@/lib/api-errors";
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
import { isBotProtectionSatisfied } from "@/lib/turnstile";

export type AuthMode = "login" | "register";

interface AuthFormProps {
  initialMode?: AuthMode;
  /** Internal path to send the user to after a successful login/register. */
  redirect?: string;
  /** Shown once, e.g. after a password reset redirects back to sign-in. */
  successMessage?: string;
  className?: string;
}

interface FormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const USERNAME_MIN = 3;
const PASSWORD_MIN = 8;
const REMEMBERED_USERNAME_KEY = "mioralane:remembered-username";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The schema is built per mode because login keeps a presence-only password
 * rule: existing accounts may predate the eight-character minimum. Registration
 * uses the relaxed rule shared with the API: length only, no character classes.
 */
const buildAuthSchema = (isRegister: boolean) =>
  z
    .object({
      username: z.string(),
      email: z.string(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      const username = values.username.trim();

      if (!username) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: "Username or email is required",
        });
      } else if (isRegister && username.length < USERNAME_MIN) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: `Username must be at least ${USERNAME_MIN} characters`,
        });
      }

      if (!values.password) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Password is required",
        });
      } else if (isRegister && values.password.length < PASSWORD_MIN) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: `Password must be at least ${PASSWORD_MIN} characters`,
        });
      }

      if (!isRegister) {
        return;
      }

      const email = values.email.trim();

      if (!email) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Email is required",
        });
      } else if (!EMAIL_PATTERN.test(email)) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Enter a valid email address",
        });
      }

      if (!values.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Please confirm your password",
        });
      } else if (values.confirmPassword !== values.password) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        });
      }
    });

const inputBase =
  "h-11 rounded-lg border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900/10 focus-visible:ring-offset-0";
const inputError = "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500/10";

export function AuthForm({
  initialMode = "login",
  redirect,
  successMessage,
  className,
}: AuthFormProps) {
  const router = useRouter();
  const { login } = useAuthStore();
  const isRegister = initialMode === "register";

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

  const schema = useMemo(() => buildAuthSchema(isRegister), [isRegister]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(successMessage ?? null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleSlotRef = useRef<HTMLDivElement | null>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(280);

  const username = watch("username");
  const email = watch("email");

  const usernameValid =
    !errors.username && username.trim().length >= (isRegister ? USERNAME_MIN : 1);
  const emailValid = !errors.email && EMAIL_PATTERN.test(email.trim());

  // A reset redirect can arrive while the form is already mounted.
  useEffect(() => {
    if (successMessage) {
      setSuccess(successMessage);
    }
  }, [successMessage]);

  // "Remember me" is frontend-only: it remembers the identifier, never a password.
  useEffect(() => {
    if (isRegister) return;

    try {
      const remembered = window.localStorage.getItem(REMEMBERED_USERNAME_KEY);

      if (remembered) {
        setValue("username", remembered, { shouldValidate: true });
        setRememberMe(true);
      }
    } catch {
      // Private mode can block storage; the checkbox still works in memory.
    }
  }, [isRegister, setValue]);

  // Google renders its button in an iframe with a fixed pixel width, so it cannot
  // be stretched with CSS. Measure the slot it sits in and render the widget at
  // that width instead.
  const applyGoogleSlotWidth = useCallback((node: HTMLElement) => {
    const width = Math.round(node.getBoundingClientRect().width);
    // Google Identity Services accepts 200–400px only.
    setGoogleButtonWidth(Math.min(400, Math.max(200, width)));
  }, []);

  // A callback ref rather than an effect: it runs during commit, before the paint
  // that would show the widget, so the button never renders at the wrong width.
  // (Effect-based measurement also depends on rAF/ResizeObserver, which a hidden
  // tab does not run.)
  const attachGoogleSlot = useCallback(
    (node: HTMLDivElement | null) => {
      googleSlotRef.current = node;
      if (node) applyGoogleSlotWidth(node);
    },
    [applyGoogleSlotWidth]
  );

  // Keep the measured width in step when the card is resized.
  useEffect(() => {
    const slot = googleSlotRef.current;
    if (!slot) return;

    const observer = new ResizeObserver(() => applyGoogleSlotWidth(slot));
    observer.observe(slot);
    return () => observer.disconnect();
  }, [applyGoogleSlotWidth]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSuccess(null);

    // Cloudflare Turnstile gate: the invisible challenge sets this once it has
    // solved. It fails open when no site key is configured (see lib/turnstile).
    if (!isBotProtectionSatisfied()) {
      setServerError(
        "Just a moment — we're completing a quick security check. Please try again."
      );
      return;
    }

    try {
      const { user, message } = isRegister
        ? await authService.register(
            values.username.trim(),
            values.email.trim(),
            values.password
          )
        : await authService.login(values.username.trim(), values.password);

      if (user) {
        login(user);
      }

      if (!isRegister) {
        try {
          if (rememberMe) {
            window.localStorage.setItem(
              REMEMBERED_USERNAME_KEY,
              values.username.trim()
            );
          } else {
            window.localStorage.removeItem(REMEMBERED_USERNAME_KEY);
          }
        } catch {
          // Storage is best-effort; authentication has already succeeded.
        }
      }

      setSuccess(
        message || (isRegister ? "Account created successfully!" : "Welcome back!")
      );

      // Give the user a moment to register the success state before redirecting.
      window.setTimeout(() => router.push(redirectTo), 900);
    } catch (error) {
      setServerError(
        (error as { code?: string } | undefined)?.code === "ERR_NETWORK"
          ? "Unable to reach the server. Please check your connection and try again."
          : formatApiError(error, "Something went wrong. Please try again.")
      );
    }
  };

  /** Handles the Google One Tap / Sign-In credential response. */
  const handleGoogleSuccess = async (response: { credential?: string }) => {
    if (!response.credential) return;

    setIsGoogleLoading(true);
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
      setServerError(
        formatApiError(error, "Google sign-in failed. Please try again.")
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const disabled = isSubmitting || isGoogleLoading;

  return (
    <div className={cn("w-full max-w-[440px]", className)}>
      <section className="rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to shop
        </Link>

        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <BrandLogo size="lg" priority />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isRegister ? "Create your account" : "Log in to your account"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isRegister
              ? "Join the Glow Club and start your K-beauty ritual."
              : "Welcome back. Enter your details to continue."}
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
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="username"
                placeholder={isRegister ? "Choose a username" : "Username or email"}
                autoComplete="username"
                disabled={disabled}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? "username-error" : undefined}
                className={cn(inputBase, "pl-10 pr-10", errors.username && inputError)}
                {...register("username")}
              />
              {usernameValid && (
                <CheckCircle2
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600"
                  aria-hidden="true"
                />
              )}
            </div>
            {errors.username && (
              <p
                id="username-error"
                role="alert"
                className="flex items-center gap-1.5 text-xs text-red-600"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email (register only) */}
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={disabled}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={cn(inputBase, "pl-10 pr-10", errors.email && inputError)}
                  {...register("email")}
                />
                {emailValid && (
                  <CheckCircle2
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600"
                    aria-hidden="true"
                  />
                )}
              </div>
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete={isRegister ? "new-password" : "current-password"}
                disabled={disabled}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={cn(inputBase, "pl-10 pr-12", errors.password && inputError)}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                disabled={disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                role="alert"
                className="flex items-center gap-1.5 text-xs text-red-600"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password (register only) */}
          {isRegister && (
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={disabled}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword ? "confirm-password-error" : undefined
                  }
                  className={cn(
                    inputBase,
                    "pl-10 pr-12",
                    errors.confirmPassword && inputError
                  )}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={disabled}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          {/* Remember me + forgot password (login only) */}
          {!isRegister && (
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="rememberMe"
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
              >
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={disabled}
            aria-busy={isSubmitting}
            className="mt-2 h-11 w-full rounded-full bg-brand-500 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus-visible:ring-brand-300 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : isRegister ? (
              "Create account"
            ) : (
              "Log in"
            )}
          </Button>

          {/* Google Sign-In */}
          <div className="relative py-2">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                or continue with
              </span>
            </div>
          </div>
          <div
            ref={attachGoogleSlot}
            className={cn(
              "flex min-h-10 w-full min-w-0 justify-center overflow-hidden rounded-full",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setServerError("Google sign-in failed. Please try again.")
              }
              size="large"
              text={isRegister ? "signup_with" : "signin_with"}
              shape="pill"
              theme="outline"
              width={googleButtonWidth}
            />
          </div>

          <p className="text-center text-sm text-gray-500">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-semibold text-gray-900 transition-colors hover:underline"
            >
              {isRegister ? "Sign in" : "Create one"}
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
