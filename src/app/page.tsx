import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

export default async function Home() {
  const config = getSupabaseBrowserConfig();

  if (!config.isConfigured) {
    redirect("/auth");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/auth");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/board" : "/auth");
}
