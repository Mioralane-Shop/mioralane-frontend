"use client";

import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";
import { useToastStore } from "@/store/toast.store";

const ICONS = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
} as const;

const COLORS = {
  success: "text-emerald-500",
  info: "text-sky-500",
  error: "text-red-500",
} as const;

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-ink/5 bg-white px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <Icon className={`h-5 w-5 flex-shrink-0 ${COLORS[toast.type]}`} />
            <p className="flex-1 text-sm font-medium text-ink">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ink/40 transition-colors hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
