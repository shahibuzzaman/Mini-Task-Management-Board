import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const config = getSupabaseBrowserConfig();

  if (!config.isConfigured) {
    return (
      <main className="mx-auto flex min-h-screen w-full flex-col items-center justify-center p-6 sm:p-8 relative">
        <SupabaseSetupNotice
          isConfigured={config.isConfigured}
          missingEnvVars={config.missingEnvVars}
        />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-surface">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-surface-tint)_0%,_transparent_60%)] opacity-20 pointer-events-none" />

      <div className="flex w-full px-6 flex-col items-center z-10 my-auto pt-16 pb-20">
        {children}
      </div>
    </main>
  );
}
