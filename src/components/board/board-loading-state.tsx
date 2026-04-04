import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";

export function BoardLoadingState() {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
      <div className="mb-6 flex flex-col gap-2 border-b border-slate-200 pb-6">
        <h2 className="text-xl font-semibold text-slate-950">Board</h2>
        <p className="text-sm leading-6 text-slate-600">
          Loading tasks from Supabase.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TASK_COLUMNS.map((column) => (
          <section
            key={column.status}
            className="min-h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="mt-6 space-y-3">
              <div className="h-24 rounded-xl bg-white" />
              <div className="h-24 rounded-xl bg-white" />
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
