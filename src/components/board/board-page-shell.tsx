import { TaskBoard } from "@/components/board/task-board";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
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
            The app shell, provider wiring, feature boundaries, and typed task
            placeholders are ready. CRUD, drag and drop, and realtime are
            intentionally deferred to later phases.
          </p>
        </header>

        {!supabaseConfig.isConfigured ? (
          <SupabaseSetupNotice missingEnvVars={supabaseConfig.missingEnvVars} />
        ) : null}

        <TaskBoard />
      </div>
    </main>
  );
}
