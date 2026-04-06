"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type InviteSignOutButtonProps = {
  nextPath: string;
};

export function InviteSignOutButton({ nextPath }: InviteSignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.replace(`/signin?next=${encodeURIComponent(nextPath)}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      Sign out and continue
    </button>
  );
}
