import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { ensureCurrentUserProfile } from "@/features/boards/lib/ensure-current-user-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRow = {
  display_name: string | null;
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/signin");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/signin");
  }

  await ensureCurrentUserProfile(supabase);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const viewer = {
    id: user.id,
    email: user.email,
    displayName: profile.display_name ?? user.email.split("@")[0] ?? "User",
  };

  return (
    <div className="flex min-h-screen bg-[#fafbfe] w-full text-slate-900 font-sans">
      <AppSidebar viewer={viewer} />
      <div className="flex flex-col flex-1 pl-[260px]">
        <AppHeader />
        <main className="flex-1 w-full bg-[#f8f9fd]">
          {children}
        </main>
      </div>
    </div>
  );
}
