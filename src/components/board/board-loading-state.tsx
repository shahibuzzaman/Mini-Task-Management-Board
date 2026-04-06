import { Skeleton } from "@/components/ui/skeleton";
import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";

export function BoardLoadingState() {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
      <div className="mb-6 border-b border-slate-200 pb-6">
        <Skeleton className="h-6 w-28 rounded-lg" />
        <Skeleton className="mt-3 h-4 w-56 rounded-md" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TASK_COLUMNS.map((column) => (
          <section
            key={column.status}
            className="min-h-80 rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
            <div className="mt-6 space-y-3">
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton className="hidden xl:block" />
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export function BoardPanelLoadingState() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="mt-3 h-8 w-16 rounded-lg" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <Skeleton className="h-4 w-36 rounded-md" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-5/6 rounded-md" />
          <Skeleton className="h-3 w-4/6 rounded-md" />
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="mt-2 h-3 w-3/4 rounded-md" />
      </div>
    </div>
  );
}

export function BoardListLoadingState({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <li
          key={index}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="mt-2 h-3 w-56 max-w-full rounded-md" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TaskActivityLoadingState({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
        >
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="mt-3 h-3 w-full rounded-md" />
          <Skeleton className="mt-2 h-3 w-4/5 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function BoardTransferOwnershipLoadingState() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-10 w-40 rounded-full" />
    </div>
  );
}

function TaskCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-full rounded-md" />
      <Skeleton className="mt-2 h-3 w-5/6 rounded-md" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
