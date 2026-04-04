type SupabaseSetupNoticeProps = {
  missingEnvVars: string[];
};

export function SupabaseSetupNotice({
  missingEnvVars,
}: SupabaseSetupNoticeProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
        Supabase Setup Needed
      </h2>
      <p className="mt-3 text-sm leading-6">
        Supabase is not configured yet, so the app is running in scaffold mode.
        Add the missing environment variables before wiring persistence or
        realtime:
      </p>
      <p className="mt-3 font-mono text-sm">
        {missingEnvVars.join(", ")}
      </p>
      <p className="mt-3 text-sm leading-6 text-amber-900/80">
        The page stays usable without these values, and no import-time error is
        thrown.
      </p>
    </section>
  );
}
