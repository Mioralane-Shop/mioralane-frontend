"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";
import { formatApiError } from "@/lib/api-errors";
import { authService } from "@/services/auth.service";
import { isBotProtectionSatisfied } from "@/lib/turnstile";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Forgot-password form. On success it shows the generic message — the API
 * deliberately never reveals whether the address is registered.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }

    if (!isBotProtectionSatisfied()) {
      setError("Just a moment — we're completing a quick security check. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSuccess(true);
    } catch (requestError) {
      setError(formatApiError(requestError, "Something went wrong. Please try again."));
    } finally {
      setIsLoading(false);
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
          <h1 className="font-serif text-[26px] text-ink">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Enter the email you signed up with and we&apos;ll send you a link to
            choose a new password.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                If an account exists with this email, you&apos;ll receive
                instructions to reset your password.
              </span>
            </div>
            <p className="mt-3 text-xs text-emerald-700/80">
              The link is valid for 1 hour. Check your spam folder if you
              don&apos;t see it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="e.g. you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  aria-invalid={Boolean(error)}
                  className={cn(
                    "h-11 rounded-lg border-border bg-surface-warm pl-10 focus-visible:ring-brand-200",
                    error && "border-red-300"
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-lg text-sm font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
