"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";
import { formatApiError } from "@/lib/api-errors";
import { authService } from "@/services/auth.service";
import { isBotProtectionSatisfied } from "@/lib/turnstile";
import { meetsPasswordPolicy } from "@/lib/password-strength";
import {
  PasswordRequirementsChecklist,
  PasswordStrengthMeter,
} from "@/components/auth/password-feedback";

type ResetState = "form" | "success";

/**
 * Password-reset form. Reads the token from `?token=...`, enforces the policy
 * and confirmation match, and redirects to sign-in after a successful reset.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [state, setState] = useState<ResetState>("form");
  const [successMessage, setSuccessMessage] = useState("Password reset successfully");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      next.password = "Password is required";
    } else if (!meetsPasswordPolicy(password)) {
      next.password =
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your new password";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    if (!token) {
      setServerError("This reset link is missing its token. Request a new link.");
      return;
    }

    if (!validate()) return;

    if (!isBotProtectionSatisfied()) {
      setServerError("Just a moment — we're completing a quick security check. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.resetPassword(token, password);
      setSuccessMessage(result.message || "Password reset successfully");
      setState("success");

      // Give the confirmation a moment, then hand over to sign-in.
      window.setTimeout(() => router.push("/login?reset=success"), 1600);
    } catch (error) {
      setServerError(formatApiError(error, "Something went wrong. Please try again."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      <section className="rounded-xl border border-border bg-white/90 px-4 py-7 shadow-lg shadow-brand-100/30 backdrop-blur sm:px-10 sm:py-10">
        <Link
          href="/login"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-brand-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        <div className="mb-8">
          <BrandLogo size="md" priority className="mb-6" />
          <h1 className="font-serif text-[26px] text-ink">Choose a new password</h1>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Make it strong — you&apos;ll use it to sign in from now on.
          </p>
        </div>

        {!token && (
          <div role="alert" aria-live="assertive" className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>This reset link is missing its token.</span>
            </div>
            <p className="text-sm leading-6 text-ink-soft">
              Reset links are valid for 1 hour and can only be used once. Request
              a new one to try again.
            </p>
            <Button asChild className="h-11 w-full rounded-lg text-sm font-semibold">
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
          </div>
        )}

        {token && state === "form" && (
          <>
            {serverError && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* New password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] text-ink">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                    className={cn(
                      "h-11 rounded-lg border-border bg-surface-warm pl-10 pr-11 focus-visible:ring-brand-200",
                      fieldErrors.password && "border-red-300"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {fieldErrors.password}
                  </p>
                )}
                <PasswordStrengthMeter password={password} />
                <PasswordRequirementsChecklist password={password} />
              </div>

              {/* Confirm */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[13px] text-ink">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
                    className={cn(
                      "h-11 rounded-lg border-border bg-surface-warm pl-10 pr-11 focus-visible:ring-brand-200",
                      fieldErrors.confirmPassword && "border-red-300"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p id="confirm-password-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg text-sm font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          </>
        )}

        {token && state === "success" && (
          <div role="status" aria-live="polite" className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Taking you to sign in…
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
