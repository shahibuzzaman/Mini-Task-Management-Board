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

      <footer className="w-full border-t border-outline-variant/20 py-8 px-6 text-[11px] font-semibold text-on-surface-variant tracking-[0.15em] flex flex-col sm:flex-row items-center justify-between z-10 mt-auto">
        <div className="uppercase">
          © 2024 TASKFLOW. BUILT FOR PRECISION.
        </div>
        <div className="flex items-center gap-6 mt-6 sm:mt-0 uppercase">
          <a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-on-surface transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-on-surface transition-colors">Security</a>
          <a href="#" className="hover:text-on-surface transition-colors">Status</a>
        </div>
      </footer>
    </main>
  );
}
