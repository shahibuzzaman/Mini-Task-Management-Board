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
            This phase sets up Supabase safely: typed environment helpers,
            database contracts, demo SQL, and a browser client that stays inert
            until credentials are configured.
          </p>
        </header>

        <SupabaseSetupNotice
          isConfigured={supabaseConfig.isConfigured}
          missingEnvVars={supabaseConfig.missingEnvVars}
        />

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Current Foundation
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Typed browser env validation with safe fallback behavior
            </p>
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Database types for `public.tasks` and future query usage
            </p>
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Demo-only anon RLS policies for local take-home setup
            </p>
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              SQL schema and seed data for `alice`, `bob`, and `charlie`
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
