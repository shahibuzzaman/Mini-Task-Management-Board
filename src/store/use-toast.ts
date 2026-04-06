"use client";

import { useUIStore } from "@/store/ui-store-provider";
import type { ToastKind } from "@/store/ui-store";

export function useToast() {
  const showToast = useUIStore((state) => state.showToast);

  return (kind: ToastKind, message: string, durationMs?: number) =>
    showToast({ kind, message, durationMs });
}
