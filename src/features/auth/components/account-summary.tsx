"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AuthViewer } from "@/features/auth/types/viewer";

type AccountSummaryProps = {
  viewer: AuthViewer;
};

export function AccountSummary({ viewer }: AccountSummaryProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Account
          </h2>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {viewer.displayName}
          </p>
          <p className="mt-1 text-sm text-slate-600">{viewer.email}</p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
