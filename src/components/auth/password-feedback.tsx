"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  measurePasswordStrength,
  PASSWORD_REQUIREMENTS,
  type StrengthMeta,
} from "@/lib/password-strength";

/**
 * Live password feedback: a four-segment strength meter (Weak → Very Strong)
 * and the policy checklist. Both update on every keystroke; the meter is
 * advisory, while the checklist gates submission in the form.
 */

export function PasswordStrengthMeter({ password }: { password: string }) {
  const [meta, setMeta] = useState<StrengthMeta | null>(null);
  const [suggestion, setSuggestion] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    measurePasswordStrength(password).then((result) => {
      if (cancelled) return;
      setMeta(result.meta);
      setSuggestion(result.suggestion);
    });

    return () => {
      cancelled = true;
    };
  }, [password]);

  if (!meta) {
    return <div className="h-1.5" aria-hidden="true" />;
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div
        className="flex items-center gap-2"
        role="status"
        aria-live="polite"
        aria-label={`Password strength: ${meta.label}`}
      >
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((segment) => (
            <span
              key={segment}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-200",
                segment <= meta.level ? meta.barClass : "bg-border"
              )}
            />
          ))}
        </div>
        <span className={cn("w-20 text-right text-xs font-medium", meta.textClass)}>
          {meta.label}
        </span>
      </div>
      {suggestion ? <p className="text-xs text-ink-muted">{suggestion}</p> : null}
    </div>
  );
}

export function PasswordRequirementsChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-3 space-y-1.5" aria-label="Password requirements">
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const satisfied = requirement.test(password);
        return (
          <li
            key={requirement.id}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-200",
              satisfied ? "text-emerald-700" : "text-ink-muted"
            )}
          >
            {satisfied ? (
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>
              {requirement.label}
              <span className="sr-only">{satisfied ? " — satisfied" : " — not satisfied"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
