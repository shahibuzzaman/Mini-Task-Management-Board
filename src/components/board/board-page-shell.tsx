import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { SimulatedUserSwitcher } from "@/components/board/simulated-user-switcher";
import { TaskBoard } from "@/components/board/task-board";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

export function BoardPageShell() {
  const supabaseConfig = getSupabaseBrowserConfig();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-8">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Take-Home Scaffold
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Mini Task Management Board
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            The board now reads tasks from Supabase through a dedicated tasks
            feature module. TanStack Query owns server state and Zustand owns
            UI-only state.
          </p>
        </header>

        <SupabaseSetupNotice
          isConfigured={supabaseConfig.isConfigured}
          missingEnvVars={supabaseConfig.missingEnvVars}
        />

        <SimulatedUserSwitcher />
        <TaskBoard />
      </div>
    </main>
  );
}
