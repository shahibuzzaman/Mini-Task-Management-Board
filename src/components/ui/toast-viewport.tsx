"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store-provider";

export function ToastViewport() {
  const toasts = useUIStore((state) => state.toasts);
  const dismissToast = useUIStore((state) => state.dismissToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100000] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          id={toast.id}
          kind={toast.kind}
          message={toast.message}
          durationMs={toast.durationMs}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}

function ToastCard({
  id,
  kind,
  message,
  durationMs,
  onDismiss,
}: {
  id: string;
  kind: "success" | "error";
  message: string;
  durationMs: number;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(id);
    }, durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [durationMs, id, onDismiss]);

  const palette =
    kind === "success"
      ? "border-emerald-200 bg-white/95 text-emerald-950 shadow-[0_18px_50px_-28px_rgba(5,150,105,0.75)]"
      : "border-rose-200 bg-white/95 text-rose-950 shadow-[0_18px_50px_-28px_rgba(225,29,72,0.75)]";

  return (
    <div
      className={`pointer-events-auto overflow-hidden rounded-2xl border backdrop-blur ${palette}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            kind === "success"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {kind === "success" ? (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          )}
        </span>
        <p className="flex-1 pt-0.5 text-sm font-medium leading-6">{message}</p>
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          aria-label="Dismiss notification"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
