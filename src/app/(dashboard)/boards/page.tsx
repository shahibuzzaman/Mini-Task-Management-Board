import { redirect } from "next/navigation";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

export default async function BoardsPage() {
  const config = getSupabaseBrowserConfig();

  if (!config.isConfigured) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10 sm:px-8">
        <SupabaseSetupNotice
          isConfigured={config.isConfigured}
          missingEnvVars={config.missingEnvVars}
        />
      </main>
    );
  }

  redirect("/dashboard");
}
